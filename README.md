<div align="center">

# 🚀 PocketPilot

### AI-Powered Personal Finance Copilot

Track expenses, analyze spending patterns, forecast future expenses, and receive personalized AI-powered financial insights—all from one intelligent dashboard.

<p>
  <img src="https://img.shields.io/badge/Next.js-15-black?logo=nextdotjs" />
  <img src="https://img.shields.io/badge/FastAPI-0.115-009688?logo=fastapi" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql" />
  <img src="https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white" />
  <img src="https://img.shields.io/badge/TailwindCSS-06B6D4?logo=tailwindcss&logoColor=white" />
  <img src="https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white" />
</p>

**🚧 Currently in Active Development**

</div>

---

## 📖 About

PocketPilot is a modern AI-powered personal finance platform that helps users understand, manage, and improve their financial health.

It combines **Full Stack Development**, **Machine Learning**, and **Generative AI** to automatically categorize transactions, analyze spending habits, forecast future expenses, and provide personalized financial recommendations.

---

## ✨ Features

- 🔐 Secure Authentication (JWT)
- 📂 CSV, Excel & PDF Bank Statement Upload
- 🤖 AI Transaction Categorization
- 📊 Interactive Expense Dashboard
- 📈 Spending Forecasting
- 🚨 Anomaly Detection
- 💬 AI Financial Advisor (RAG)
- 💰 Personalized Budget Recommendations
- 🎯 Savings Goal Planner
- ❤️ Financial Health Score

---

## 🛠 Tech Stack

### Frontend

- Next.js 15
- TypeScript
- Tailwind CSS
- shadcn/ui
- Framer Motion
- Recharts

### Backend

- FastAPI
- PostgreSQL
- SQLAlchemy
- Alembic
- JWT Authentication

### AI & ML

- LangChain
- Gemini / OpenAI
- FAISS
- scikit-learn
- Prophet
- XGBoost
- Isolation Forest

### DevOps

- Docker
- GitHub Actions

### Cloud

- AWS

---

## 🏗️ Architecture

```text
                   Next.js Frontend
                           │
                           ▼
                    FastAPI Backend
                           │
      ┌──────────────┬──────────────┐
      ▼              ▼              ▼
 PostgreSQL      AI Services      ML Services
                           │
                           ▼
                  Vector Database (FAISS)
```

---

## 📅 Development Progress

- ✅ Day 1 — Project Setup & Authentication
- ✅ Day 2 — Statement Upload
- ✅ Day 3 — AI Categorization & Dashboard
- ✅ Day 4 — Forecasting & Analytics
- ⏳ Day 5 — AI Financial Advisor (RAG)
- ⏳ Day 6 — UI/UX Polish
- ⏳ Day 7 — Deployment & CI/CD

---

## 🚀 Local Setup

```bash
# Clone Repository
git clone https://github.com/<your-username>/PocketPilot.git

cd PocketPilot
```

### Frontend

```bash
cd frontend
npm install
npm run dev
```

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn app.main:app --reload
```

### Docker

```bash
docker compose up --build
```

---

## 📂 Project Structure

```text
PocketPilot/
│
├── frontend/
├── backend/
├── docker/
├── docs/
└── README.md
```

---

## 🎯 Roadmap

- [x] Authentication
- [x] Statement Upload
- [x] Transaction Categorization
- [x] Expense Analytics
- [ ] Spending Forecast
- [ ] AI Financial Advisor
- [ ] Budget Planner
- [ ] Savings Goals
- [ ] Financial Health Score
- [ ] AWS Deployment

---

## 🤝 Contributing

Contributions, ideas, and feedback are always welcome.

---

## 📄 License

This project is licensed under the MIT License.

---

<div align="center">

### ⭐ Star this repository if you like the project!

**Built with ❤️ using Next.js, FastAPI, AI, and Machine Learning.**

</div>
