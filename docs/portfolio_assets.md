# PocketPilot - Portfolio Assets

Use these assets to showcase PocketPilot on your resume, LinkedIn, and portfolio website.

## GitHub Assets

### GitHub Badges (Add to top of README)
```markdown
![Next.js](https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js)
![FastAPI](https://img.shields.io/badge/FastAPI-0.110.0-009688?style=for-the-badge&logo=fastapi&logoColor=white)
![AWS](https://img.shields.io/badge/AWS-EC2%20|%20RDS-FF9900?style=for-the-badge&logo=amazonaws&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-CI%2FCD-2496ED?style=for-the-badge&logo=docker&logoColor=white)
![Google Gemini](https://img.shields.io/badge/Gemini-AI%20Copilot-4285F4?style=for-the-badge&logo=google&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge)
```

### GitHub Topics (Tags)
`fintech` `artificial-intelligence` `rag-pipeline` `nextjs15` `fastapi` `aws-architecture` `docker-compose` `machine-learning` `personal-finance` `gemini-llm`

---

## Pitch Descriptions

### Resume Description (Bullet Points)
* **Architected and developed an AI-powered personal finance SaaS** using Next.js 15, FastAPI, and PostgreSQL, processing user transactions via a robust Retrieval-Augmented Generation (RAG) pipeline.
* **Engineered a highly available AWS infrastructure** utilizing EC2 Auto Scaling Groups, Application Load Balancers, and a zero-downtime rolling CI/CD deployment pipeline via GitHub Actions and AWS Systems Manager.
* **Integrated Machine Learning pipelines** leveraging Google Gemini LLM for complex PDF statement parsing, Facebook Prophet for time-series expense forecasting, and FAISS for vector-based financial querying.
* **Implemented enterprise-grade security and performance optimizations**, including OAuth2 JWT authentication, bcrypt password hashing, aioredis caching, and asynchronous database connections.

### LinkedIn Description
I'm incredibly excited to share a project I've been architecting: **PocketPilot** 🚀 — an AI-powered personal finance copilot! 

Unlike traditional finance apps where you manually categorize expenses, PocketPilot utilizes a custom RAG (Retrieval-Augmented Generation) pipeline. You upload your bank PDFs, and the system uses Google Gemini to parse, clean, and embed your transactions. You can then chat with your financial data naturally! ("How much did I spend on dining out last month?")

**Tech Stack Highlights:**
🔹 **Frontend**: Next.js 15 (App Router), Tailwind CSS, Framer Motion, React Three Fiber for a stunning 3D UI.
🔹 **Backend**: Fully asynchronous FastAPI (Python), PostgreSQL, Redis, FAISS vector store.
🔹 **AI/ML**: Google Gemini, Facebook Prophet (for expense forecasting), HuggingFace embeddings.
🔹 **Infrastructure**: Dockerized and deployed on AWS (EC2 Auto Scaling Groups, Application Load Balancers) with a zero-downtime CI/CD pipeline via GitHub Actions.

Check out the architecture diagrams and code here: [Link to GitHub]
#SoftwareEngineering #AI #MachineLearning #NextJS #AWS #FastAPI #Fintech

### Portfolio Description (Short)
PocketPilot is a modern fintech SaaS that replaces manual budgeting with Artificial Intelligence. Built on a scalable AWS microservices architecture, it leverages Google Gemini and a custom RAG pipeline to parse bank statements, forecast future expenses using Machine Learning, and act as a conversational financial advisor.

### Recruiter-Friendly Project Summary
A full-stack, AI-driven financial application built using industry-standard DevOps practices. The project demonstrates senior-level system design, encompassing a React-based 3D frontend, an asynchronous Python backend, a sophisticated LLM/Vector database pipeline, and a highly available, auto-scaling cloud deployment on AWS.

---

## Highlights

### Technical Highlights
- **Zero-Downtime CI/CD**: Engineered a custom GitHub Actions pipeline that orchestrates rolling updates across an AWS EC2 Auto Scaling Group using SSM commands and container locks, entirely eliminating deployment downtime.
- **Asynchronous Architecture**: The entire backend is built with non-blocking I/O (FastAPI, AsyncPG, AioRedis), ensuring high throughput for data processing and AI API calls.
- **RAG Implementation**: Built a custom Retrieval-Augmented Generation engine using HuggingFace embeddings (`all-MiniLM-L6-v2`), FAISS, and Gemini to allow contextual LLM queries over user-specific tabular data.

### Feature Highlights
- **AI Statement Parsing**: Users upload messy PDF bank statements, and the AI guarantees a clean, strictly-typed JSON extraction of merchants, dates, and amounts.
- **Time-Series Forecasting**: Integrated Facebook Prophet to analyze historical spending velocity and accurately forecast the user's budget for the upcoming 30 days.
- **Premium 3D UI**: Moving beyond standard dashboards, the frontend incorporates interactive WebGL/Three.js visualizations built with `@react-three/fiber` for a deeply engaging user experience.
