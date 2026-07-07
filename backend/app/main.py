from __future__ import annotations

from contextlib import asynccontextmanager
from collections.abc import AsyncIterator

from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.middleware.gzip import GZipMiddleware
from fastapi.responses import JSONResponse, ORJSONResponse
from pydantic import ValidationError

from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.util import get_remote_address
from slowapi.errors import RateLimitExceeded
from secure import Secure

from fastapi_cache import FastAPICache
from fastapi_cache.backends.redis import RedisBackend
from fastapi_cache.backends.inmemory import InMemoryBackend
from redis import asyncio as aioredis

from app.config import settings
from app.features.auth.router import router as auth_router
from app.features.users.router import router as users_router
from app.features.transactions.router import router as transactions_router
from app.features.analytics.router import router as analytics_router
from app.features.copilot.router import router as copilot_router


@asynccontextmanager
async def lifespan(_app: FastAPI) -> AsyncIterator[None]:
    if settings.redis_url:
        redis = aioredis.from_url(settings.redis_url, encoding="utf8", decode_responses=False)
        FastAPICache.init(RedisBackend(redis), prefix="pocketpilot-cache")
    else:
        FastAPICache.init(InMemoryBackend(), prefix="pocketpilot-cache")
    yield

limiter = Limiter(key_func=get_remote_address)
secure_headers = Secure()

def create_app() -> FastAPI:
    application = FastAPI(
        title="PocketPilot API",
        description="AI-powered Personal Finance Copilot",
        version="0.1.0",
        lifespan=lifespan,
        docs_url="/docs",
        redoc_url="/redoc",
        default_response_class=ORJSONResponse,
    )

    application.add_middleware(GZipMiddleware, minimum_size=1000)

    application.state.limiter = limiter
    application.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

    @application.middleware("http")
    async def set_secure_headers(request: Request, call_next):
        response = await call_next(request)
        secure_headers.set_headers(response)
        return response

    application.add_middleware(
        CORSMiddleware,
        allow_origins=settings.cors_origins,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    @application.exception_handler(ValidationError)
    async def validation_exception_handler(
        _request: Request, exc: ValidationError
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={"detail": exc.errors()},
        )

    @application.exception_handler(Exception)
    async def generic_exception_handler(
        _request: Request, _exc: Exception
    ) -> JSONResponse:
        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={"detail": "An unexpected error occurred."},
        )

    @application.get("/health", tags=["System"])
    @limiter.limit("60/minute")
    async def health_check(request: Request) -> dict[str, str]:
        return {"status": "healthy", "service": "pocketpilot-api"}

    application.include_router(auth_router, prefix="/api/v1")
    application.include_router(users_router, prefix="/api/v1")
    application.include_router(transactions_router, prefix="/api/v1")
    application.include_router(analytics_router, prefix="/api/v1")
    application.include_router(copilot_router, prefix="/api/v1")

    return application

app = create_app()
