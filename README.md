<div align="center">
  <h1>PocketPilot</h1>
  <p><strong>Your AI-Powered Personal Finance Copilot</strong></p>
  
  <p>
    <a href="https://pocketpilot-fin.vercel.app">Demo</a>
  </p>
</div>

---

## 🚀 Project Overview

**PocketPilot** is a next-generation personal finance tracking and advisory application. Rather than manually categorizing expenses, PocketPilot allows users to effortlessly upload their bank statements (PDFs), where our AI pipeline automatically extracts, cleans, and categorizes transaction data. 

Coupled with a **Retrieval-Augmented Generation (RAG) Copilot** and **Machine Learning forecasting**, PocketPilot doesn't just track where your money went—it tells you *why* and predicts *where it will go next*.

## ✨ Features

- **Automated Statement Parsing**: Upload bank PDFs; AI extracts merchants, dates, and amounts seamlessly.
- **Smart Categorization**: Transactions are automatically mapped to standard financial categories.
- **AI Financial Copilot**: Chat with your financial data. Ask "How much did I spend on food this month?" and get accurate, context-aware answers.
- **Expense Forecasting**: Machine learning models predict your next month's spending patterns.
- **Anomaly Detection**: Automatically flags unusual or duplicate transactions.
- **Stunning 3D UI**: Built with Next.js, Framer Motion, and React Three Fiber for a premium, dynamic user experience.

---

## 🏗️ Architecture

PocketPilot is built using a modern, scalable, and highly performant stack:

- **Frontend**: Next.js (App Router), React 19, TypeScript, Tailwind CSS, Framer Motion, Shadcn UI.
- **Backend**: FastAPI (Python), SQLAlchemy (Async), PostgreSQL, Redis.
- **AI/ML**: OpenAI (LLM & Embeddings), LangChain, FAISS (Vector Store), Facebook Prophet (Forecasting), Scikit-Learn (Anomaly Detection).
- **Infrastructure**: Vercel (Frontend), Render (Backend), Neon (PostgreSQL Database).

### Folder Structure
```text
pocketpilot/
├── frontend/                 # Next.js Application
│   ├── src/app/              # App router & pages
│   ├── src/components/       # Reusable UI components & 3D scenes
│   └── src/providers/        # Context providers (Auth, Query)
├── backend/                  # FastAPI Application
│   ├── app/                  # Application code (routers, models)
│   ├── tests/                # Pytest suite
│   ├── alembic/              # Database migrations
│   └── docs/                 # OpenAPI & Postman specs
├── docs/                     # Documentation & Architecture diagrams
└── docker-compose.yml        # Local development orchestration
```

---

## ⚙️ Installation

### Prerequisites
- Docker & Docker Compose
- Node.js (v20+)
- Python (3.11+)

### Local Development

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Vaibhav-Rajput-connect/pocketpilot.git
   cd pocketpilot
   ```

2. **Backend Setup:**
   ```bash
   cd backend
   python -m venv .venv
   source .venv/bin/activate
   pip install -e ".[dev]"
   ```

3. **Frontend Setup:**
   ```bash
   cd ../frontend
   npm install --legacy-peer-deps
   ```

## 🔐 Environment Variables

Create a `.env` file in both the `frontend` and `backend` directories.

**Backend (`backend/.env`):**
```env
DATABASE_URL=postgresql+asyncpg://user:password@localhost:5432/pocketpilot
REDIS_URL=redis://localhost:6379/0
JWT_SECRET_KEY=your_super_secret_key
OPENAI_API_KEY=your_openai_api_key
```

**Frontend (`frontend/.env.local`):**
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

## 🐳 Docker Setup

To run the entire stack locally using Docker Compose:

```bash
docker-compose up --build
```
- Frontend will be available at `http://localhost:3000`
- Backend API will be available at `http://localhost:8000/docs`

---

## ☁️ Deployment

PocketPilot is engineered for modern cloud deployment:

1. **Frontend**: Deployed on **Vercel** for edge caching and fast global delivery.
2. **Backend**: Deployed on **Render** using a managed Docker runtime.
3. **Database**: Managed serverless PostgreSQL on **Neon**.

---

## 🗄️ Database Schema

The PostgreSQL database uses the following core entities:
- `users`: Core identity (email, password hashes, preferences).
- `transactions`: Financial ledgers (amount, date, merchant, category, type, confidence_score).
- `chat_history`: Stores the RAG conversational memory for the Copilot.

Migrations are fully managed via **Alembic**.

---

## 🧠 AI Pipeline

### RAG Architecture
The PocketPilot Copilot uses a Retrieval-Augmented Generation (RAG) architecture to answer questions about your specific finances:
1. **Embedding**: When transactions are uploaded, they are embedded using OpenAI's `text-embedding-3-small` model.
2. **Vector Store**: Embeddings are stored in an in-memory **FAISS** index.
3. **Retrieval**: User queries are embedded, and the top-k most relevant transactions are retrieved.
4. **Generation**: The context is fed into **OpenAI (GPT-4o-mini)**, which generates a natural language, highly personalized response.

### Machine Learning Pipeline
- **Forecasting**: We use **Facebook Prophet** to model time-series spending data, accounting for weekly and monthly seasonalities to predict future expenses.
- **Anomaly Detection**: We utilize **Scikit-Learn's Isolation Forest** algorithm to detect statistically abnormal transactions based on historical merchant and category spending bounds.

---

## 🛡️ Authentication Flow

PocketPilot implements a secure **OAuth2 Password Flow** using JWT (JSON Web Tokens).
1. User submits credentials to `/api/v1/auth/login`.
2. Backend verifies bcrypt password hash and returns an `access_token` (valid for 15 mins).
3. Frontend stores the token securely and attaches it as a `Bearer` token in the `Authorization` header for all subsequent API requests.

---

## 🔄 CI/CD

We use **GitHub Actions** for continuous integration and deployment:
1. **CI Pipeline**: Runs `pytest` on the backend and `vitest` on the frontend on every pull request.
2. **CD Pipeline**: 
   - Render automatically deploys the backend container on pushes to the `main` branch.
   - Vercel automatically builds and deploys the frontend.

---

## ⚡ Performance Optimizations

- **Frontend**: Next.js App Router with React Server Components, aggressive image optimization, code splitting, and lazy loading for 3D Three.js assets.
- **Backend**: Fully asynchronous FastAPI (`async def`), `asyncpg` for non-blocking database queries, and Redis for caching LLM responses and rate-limiting.
- **Database**: Appropriate indexing on `user_id` and `date` columns to ensure lightning-fast aggregations.

## 🔒 Security Features

- **Passwords**: Hashed with robust `bcrypt` algorithms.
- **Headers**: Implements `Secure` HTTP headers (HSTS, X-Frame-Options) via the `secure` python library.
- **Rate Limiting**: IP-based rate limiting via `slowapi` to prevent brute force and DDoS attacks.
- **Input Validation**: Strict schema validation via Pydantic (`backend`) and Zod (`frontend`).
- **CORS**: Strictly configured to only allow the production frontend origin.

---

## 🔮 Future Scope

- **Plaid Integration**: Direct bank syncing as an alternative to PDF uploads.
- **Multi-Currency Support**: Real-time FX rates for international travelers.
- **Advanced Tax Prep**: AI categorization tailored specifically for tax write-offs.

---

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

We welcome contributions! Please follow these steps:
1. Fork the repository.
2. Create a new feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'feat: Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.
