# PocketPilot - Final Production Checklist

This checklist verifies that the application meets enterprise standards before a public launch.

## 🚀 1. Launch Checklist
- [x] Application compiles successfully (Frontend & Backend).
- [x] All unit and integration tests pass (`pytest` & `vitest`).
- [x] CI/CD pipeline correctly handles code pushes.
- [x] Domain is correctly routed to the AWS Application Load Balancer.
- [x] `README.md` and API documentation are up to date.

## ☁️ 2. AWS Infrastructure Checklist
- [x] **Compute**: EC2 Auto Scaling Group is configured across multiple Availability Zones for high availability.
- [x] **Network**: ALB is actively routing traffic and SSL/TLS certificates (ACM) are attached.
- [x] **Database**: RDS PostgreSQL is placed in a private subnet, with automated backups enabled.
- [x] **Security Groups**: EC2 instances only accept traffic from the ALB. RDS only accepts traffic from the EC2 ASG.
- [x] **IAM Roles**: EC2 instances have the `AmazonSSMManagedInstanceCore` and `AmazonEC2ContainerRegistryReadOnly` policies attached.

## 🐳 3. Docker & Deployment Checklist
- [x] Dockerfiles are optimized (multi-stage builds, minimal base images like `python:3.11-slim`).
- [x] Secrets are passed securely via environment variables (never hardcoded in images).
- [x] `ci-deploy.sh` implements hardware file locks (`flock`) to prevent race conditions.
- [x] `ci-deploy.sh` waits for the Docker daemon and AWS CLI to be ready on newly launched instances.
- [x] SSM deployment gracefully skips instances that are not yet reporting `Online`.
- [x] GitHub Actions `concurrency` is configured to cancel stale deployments.

## 🔒 4. Security Checklist
- [x] **Authentication**: OAuth2 with JWT Bearer tokens implemented. Tokens expire securely.
- [x] **Passwords**: Passwords are mathematically hashed using `bcrypt` before database insertion.
- [x] **CORS**: `cors_origins` is strictly limited to the production frontend domain (no `*` wildcards in prod).
- [x] **Rate Limiting**: IP-based rate limiting is applied via `slowapi` to prevent DDoS/brute forcing.
- [x] **Headers**: Secure HTTP headers (HSTS, X-Content-Type-Options) are applied globally.

## ⚡ 5. Performance Checklist
- [x] **Database**: `asyncpg` is used to prevent the FastAPI event loop from blocking during queries.
- [x] **Caching**: `aioredis` and `FastAPICache` are implemented to cache static or expensive analytics responses.
- [x] **Frontend**: Next.js App Router utilizes Server Components where possible to reduce client bundle size.
- [x] **Assets**: 3D objects and heavy libraries (Three.js, Framer Motion) are dynamically imported/lazy-loaded.
- [x] **Compression**: GZip middleware is enabled on the backend to reduce JSON payload sizes.

## 🧪 6. Testing Checklist
- [x] **Backend Isolation**: `conftest.py` successfully mocks database and Redis connections so tests run entirely in-memory.
- [x] **Frontend Isolation**: Browser-specific APIs (`IntersectionObserver`) and WebGL canvases are correctly stubbed in `vitest-setup.ts`.
- [x] **Code Coverage**: Critical paths (Authentication, API probes, Landing Page rendering) are covered.
