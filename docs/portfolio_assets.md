# PocketPilot - Portfolio Assets

Use these assets to showcase PocketPilot on your resume, LinkedIn, and portfolio website.

## GitHub Assets

### GitHub Badges (Add to top of README)
```markdown
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![Render](https://img.shields.io/badge/Render-Backend-46E3B7?style=for-the-badge&logo=render&logoColor=white)
![Vercel](https://img.shields.io/badge/Vercel-Frontend-000000?style=for-the-badge&logo=vercel&logoColor=white)
![OpenAI](https://img.shields.io/badge/OpenAI-AI%20Copilot-412991?style=for-the-badge&logo=openai&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)
```

### GitHub Topics (Tags)
`fintech` `artificial-intelligence` `rag-pipeline` `nextjs15` `fastapi` `render-deployment` `vercel` `machine-learning` `personal-finance` `openai`

---

## Pitch Descriptions

### Resume Description (Bullet Points)
* **Architected and developed an AI-powered personal finance SaaS** using Next.js 15, FastAPI, and PostgreSQL, processing user transactions via a robust Retrieval-Augmented Generation (RAG) pipeline.
* **Engineered a modern cloud infrastructure** utilizing Vercel for edge frontend delivery, Render for managed backend containers, and Neon for serverless PostgreSQL, connected via an automated GitHub Actions CI/CD pipeline.
* **Integrated Machine Learning pipelines** leveraging OpenAI LLMs for complex PDF statement parsing, Facebook Prophet for time-series expense forecasting, and FAISS for vector-based financial querying.
* **Implemented enterprise-grade security and performance optimizations**, including OAuth2 JWT authentication, bcrypt password hashing, and asynchronous database connections.

### LinkedIn Description
I'm incredibly excited to share a project I've been architecting: **PocketPilot** 🚀 — an AI-powered personal finance copilot! 

Unlike traditional finance apps where you manually categorize expenses, PocketPilot utilizes a custom RAG (Retrieval-Augmented Generation) pipeline. You upload your bank PDFs, and the system uses OpenAI to parse, clean, and embed your transactions. You can then chat with your financial data naturally! ("How much did I spend on dining out last month?")

**Tech Stack Highlights:**
🔹 **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion, React Three Fiber for a stunning 3D UI, deployed on Vercel.
🔹 **Backend**: Fully asynchronous FastAPI (Python), PostgreSQL, FAISS vector store, deployed on Render.
🔹 **AI/ML**: OpenAI (GPT-4o & Embeddings), Facebook Prophet (for expense forecasting).
🔹 **Infrastructure**: Modern serverless architecture with Neon PostgreSQL and a zero-downtime CI/CD pipeline via GitHub Actions.

Check out the architecture diagrams and code here: [Link to GitHub]
#SoftwareEngineering #AI #MachineLearning #NextJS #FastAPI #Fintech #OpenAI

### Portfolio Description (Short)
PocketPilot is a modern fintech SaaS that replaces manual budgeting with Artificial Intelligence. Built on a scalable cloud microservices architecture, it leverages OpenAI and a custom RAG pipeline to parse bank statements, forecast future expenses using Machine Learning, and act as a conversational financial advisor.

### Recruiter-Friendly Project Summary
A full-stack, AI-driven financial application built using industry-standard DevOps practices. The project demonstrates senior-level system design, encompassing a React-based 3D frontend on Vercel, an asynchronous Python backend on Render, a sophisticated LLM/Vector database pipeline, and a modern serverless deployment.

---

## Highlights

### Technical Highlights
- **Automated CI/CD**: Engineered a custom GitHub Actions pipeline that orchestrates deployments to Render and Vercel, ensuring quick and reliable rollouts.
- **Asynchronous Architecture**: The entire backend is built with non-blocking I/O (FastAPI, AsyncPG), ensuring high throughput for data processing and AI API calls.
- **RAG Implementation**: Built a custom Retrieval-Augmented Generation engine using OpenAI embeddings, FAISS, and GPT models to allow contextual LLM queries over user-specific tabular data.

### Feature Highlights
- **AI Statement Parsing**: Users upload messy PDF bank statements, and the AI guarantees a clean, strictly-typed JSON extraction of merchants, dates, and amounts.
- **Time-Series Forecasting**: Integrated Facebook Prophet to analyze historical spending velocity and accurately forecast the user's budget for the upcoming 30 days.
- **Premium 3D UI**: Moving beyond standard dashboards, the frontend incorporates interactive WebGL/Three.js visualizations built with `@react-three/fiber` for a deeply engaging user experience.
