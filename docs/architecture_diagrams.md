# PocketPilot Architecture Diagrams

This document provides visual representations of the various systems, pipelines, and infrastructure that power PocketPilot. All diagrams are generated using [Mermaid.js](https://mermaid-js.github.io/mermaid/).

---

## 1. Overall System Architecture

```mermaid
graph TD
    Client["Client (Browser / Mobile)"]
    subgraph "Frontend Layer"
        NextJS["Next.js Application\n(React 19, Tailwind, 3D UI)"]
    end
    
    subgraph "Backend Layer"
        FastAPI["FastAPI Backend\n(Python, Async)"]
    end
    
    subgraph "Data Storage"
        PostgreSQL[("PostgreSQL\n(Relational Data)")]
        Redis[("Redis\n(Caching / Rate Limiting)")]
        FAISS[("FAISS\n(Vector Index)")]
    end
    
    subgraph "AI & ML Services"
        Gemini["Google Gemini LLM\n(Parsing & Generation)"]
        Prophet["Facebook Prophet\n(Forecasting)"]
        IsolationForest["Scikit-Learn\n(Anomaly Detection)"]
    end

    Client -->|HTTPS| NextJS
    NextJS -->|REST API| FastAPI
    FastAPI -->|AsyncPG| PostgreSQL
    FastAPI -->|aioredis| Redis
    FastAPI -->|Read/Write| FAISS
    FastAPI -->|API Calls| Gemini
    FastAPI -->|Time-Series Data| Prophet
    FastAPI -->|Tabular Data| IsolationForest
```

---

## 2. AWS Infrastructure

```mermaid
graph TB
    Internet((Internet))
    Route53{"Route 53\n(DNS)"}
    ALB["Application Load Balancer\n(ACM SSL)"]
    
    subgraph "VPC (Virtual Private Cloud)"
        subgraph "Auto Scaling Group"
            EC2_1["EC2 Instance 1\n(Docker: Backend)"]
            EC2_2["EC2 Instance N\n(Docker: Backend)"]
        end
        
        RDS[("AWS RDS\n(PostgreSQL)")]
        ElastiCache[("AWS ElastiCache\n(Redis)")]
    end
    
    subgraph "AWS Managed Services"
        ECR{"AWS ECR\n(Docker Registry)"}
        CloudWatch{"CloudWatch\n(Logs & Metrics)"}
        SSM{"AWS Systems Manager\n(Deployment)"}
    end

    Internet --> Route53
    Route53 --> ALB
    ALB --> EC2_1
    ALB --> EC2_2
    
    EC2_1 --> RDS
    EC2_2 --> RDS
    EC2_1 --> ElastiCache
    EC2_2 --> ElastiCache
    
    EC2_1 -.->|Pulls Image| ECR
    EC2_2 -.->|Pulls Image| ECR
    
    EC2_1 -.->|Pushes Logs| CloudWatch
    EC2_2 -.->|Pushes Logs| CloudWatch
    
    SSM -.->|Triggers Deploy| EC2_1
    SSM -.->|Triggers Deploy| EC2_2
```

---

## 3. Database ER Diagram

```mermaid
erDiagram
    USERS {
        uuid id PK
        string full_name
        string email
        string password_hash
        float monthly_income
        string currency
        datetime created_at
        datetime updated_at
    }
    
    TRANSACTIONS {
        uuid id PK
        uuid user_id FK
        datetime date
        string merchant
        float amount
        string category
        string transaction_type
        float confidence_score
        datetime created_at
    }
    
    CHAT_HISTORY {
        uuid id PK
        uuid user_id FK
        string role
        text content
        datetime timestamp
    }
    
    USERS ||--o{ TRANSACTIONS : "has"
    USERS ||--o{ CHAT_HISTORY : "has"
```

---

## 4. Authentication Flow (OAuth2 with JWT)

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant Backend
    participant Database

    User->>Frontend: Enters Email & Password
    Frontend->>Backend: POST /api/v1/auth/login (form-data)
    Backend->>Database: Fetch User by Email
    Database-->>Backend: Return User Hash
    Backend->>Backend: Verify bcrypt Hash
    Backend-->>Frontend: 200 OK (access_token, bearer)
    
    Note over Frontend: Stores Token securely
    
    Frontend->>Backend: GET /api/v1/users/me (Authorization: Bearer <token>)
    Backend->>Backend: Decode & Verify JWT signature
    Backend-->>Frontend: 200 OK (User Data)
```

---

## 5. Transaction Processing Flow (AI Parsing)

```mermaid
sequenceDiagram
    participant User
    participant Backend
    participant PDFPlumber
    participant Gemini as Google Gemini
    participant DB as PostgreSQL
    participant VectorStore as FAISS
    
    User->>Backend: POST /upload (PDF file)
    Backend->>PDFPlumber: Extract raw text from PDF
    PDFPlumber-->>Backend: Return raw text string
    
    Backend->>Gemini: Prompt with raw text & JSON schema
    Gemini-->>Backend: Return strict JSON array of transactions
    
    Backend->>DB: Insert transactions
    Backend->>VectorStore: Embed transaction strings & update Index
    Backend-->>User: 201 Created (Success & Summary)
```

---

## 6. Machine Learning Pipeline (Analytics)

```mermaid
graph LR
    DB[("PostgreSQL\n(Historical Transactions)")]
    
    subgraph "Forecasting (Facebook Prophet)"
        PrepData1["Aggregate Daily Spending"]
        Train1["Fit Prophet Model\n(Seasonality, Trends)"]
        Predict1["Predict Next 30 Days"]
    end
    
    subgraph "Anomaly Detection (Isolation Forest)"
        PrepData2["Extract Features\n(Amount, Category encoding)"]
        Train2["Fit Isolation Forest"]
        Predict2["Identify Outliers (-1)"]
    end

    DB --> PrepData1
    PrepData1 --> Train1 --> Predict1
    
    DB --> PrepData2
    PrepData2 --> Train2 --> Predict2
```

---

## 7. RAG (Retrieval-Augmented Generation) Pipeline

```mermaid
flowchart TD
    Q["User Query: 'How much did I spend on food?'"] --> Embedder["HuggingFace Embeddings\n(all-MiniLM-L6-v2)"]
    Embedder --> Vector["Dense Vector [384d]"]
    
    Vector --> FAISS{{"FAISS Vector Search"}}
    Transactions[("Transaction Database\n(Embedded representations)")] --> FAISS
    
    FAISS --> Context["Top-K Relevant Transactions"]
    
    Q --> PromptTemplate
    Context --> PromptTemplate
    
    PromptTemplate["System Prompt + Query + Context"] --> LLM["Google Gemini Model"]
    LLM --> Answer["Personalized Financial Answer"]
```

---

## 8. CI/CD Deployment Pipeline

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GitHub as GitHub Actions
    participant ECR as AWS ECR
    participant SSM as AWS Systems Manager
    participant ASG as Auto Scaling Group (EC2)

    Dev->>GitHub: Push to `main` branch
    GitHub->>GitHub: Run `pytest` and `npm test`
    GitHub->>GitHub: Build Docker Image
    GitHub->>ECR: Push Image (tag: `latest` & `SHA`)
    
    GitHub->>SSM: Send-Command `ci-deploy.sh`
    SSM->>ASG: Execute command on instances
    
    ASG->>ECR: Pull `latest` Image
    ASG->>ASG: Restart Docker containers
    ASG->>ASG: Wait for `/health/ready` probe
    ASG-->>SSM: Report Success
    SSM-->>GitHub: Deployment Complete
```

---

## 9. Docker Architecture (Local Orchestration)

```mermaid
graph TD
    Host["Developer Host Machine"]
    
    subgraph "Docker Compose Network (pocketpilot_network)"
        Nginx["Nginx Reverse Proxy\n(:80)"]
        Frontend["Next.js Container\n(:3000)"]
        Backend["FastAPI Container\n(:8000)"]
        Postgres[("PostgreSQL Container\n(:5432)")]
        Redis[("Redis Container\n(:6379)")]
    end
    
    Host -->|HTTP| Nginx
    Nginx -->|/api/*| Backend
    Nginx -->|/*| Frontend
    
    Backend --> Postgres
    Backend --> Redis
```
