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
        OpenAI["OpenAI LLM\n(Parsing & Generation)"]
        Prophet["Facebook Prophet\n(Forecasting)"]
        IsolationForest["Scikit-Learn\n(Anomaly Detection)"]
    end

    Client -->|HTTPS| NextJS
    NextJS -->|REST API| FastAPI
    FastAPI -->|AsyncPG| PostgreSQL
    FastAPI -->|aioredis| Redis
    FastAPI -->|Read/Write| FAISS
    FastAPI -->|API Calls| OpenAI
    FastAPI -->|Time-Series Data| Prophet
    FastAPI -->|Tabular Data| IsolationForest
```

---

## 2. Database ER Diagram

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

## 3. Authentication Flow (OAuth2 with JWT)

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

## 4. Transaction Processing Flow (AI Parsing)

```mermaid
sequenceDiagram
    participant User
    participant Backend
    participant PDFPlumber
    participant OpenAI as OpenAI (GPT)
    participant DB as PostgreSQL
    participant VectorStore as FAISS
    
    User->>Backend: POST /upload (PDF file)
    Backend->>PDFPlumber: Extract raw text from PDF
    PDFPlumber-->>Backend: Return raw text string
    
    Backend->>OpenAI: Prompt with raw text & JSON schema
    OpenAI-->>Backend: Return strict JSON array of transactions
    
    Backend->>DB: Insert transactions
    Backend->>VectorStore: Embed transaction strings & update Index
    Backend-->>User: 201 Created (Success & Summary)
```

---

## 5. Machine Learning Pipeline (Analytics)

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

## 6. RAG (Retrieval-Augmented Generation) Pipeline

```mermaid
flowchart TD
    Q["User Query: 'How much did I spend on food?'"] --> Embedder["OpenAI Embeddings\n(text-embedding-3-small)"]
    Embedder --> Vector["Dense Vector [1536d]"]
    
    Vector --> FAISS{{"FAISS Vector Search"}}
    Transactions[("Transaction Database\n(Embedded representations)")] --> FAISS
    
    FAISS --> Context["Top-K Relevant Transactions"]
    
    Q --> PromptTemplate
    Context --> PromptTemplate
    
    PromptTemplate["System Prompt + Query + Context"] --> LLM["OpenAI GPT Model"]
    LLM --> Answer["Personalized Financial Answer"]
```

---

## 7. CI/CD Deployment Pipeline

```mermaid
sequenceDiagram
    participant Dev as Developer
    participant GitHub as GitHub Actions
    participant Render as Render Platform
    participant Vercel as Vercel Platform

    Dev->>GitHub: Push to `main` branch
    GitHub->>GitHub: Run `pytest` and `npm test`
    
    GitHub->>Render: Trigger Backend Build
    Render->>Render: Build Docker Image
    Render->>Render: Deploy Container
    
    GitHub->>Vercel: Trigger Frontend Build
    Vercel->>Vercel: Build Next.js App
    Vercel->>Vercel: Deploy to Edge
```

---

## 8. Docker Architecture (Local Orchestration)

```mermaid
graph TD
    Host["Developer Host Machine"]
    
    subgraph "Docker Compose Network (pocketpilot_network)"
        Frontend["Next.js Container\n(:3000)"]
        Backend["FastAPI Container\n(:8000)"]
        Postgres[("PostgreSQL Container\n(:5432)")]
        Redis[("Redis Container\n(:6379)")]
    end
    
    Host -->|HTTP| Frontend
    Host -->|HTTP| Backend
    
    Backend --> Postgres
    Backend --> Redis
```
