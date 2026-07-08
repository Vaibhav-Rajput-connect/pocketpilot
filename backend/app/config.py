from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Environment
    environment: str = "dev"

    # Database
    database_url: str = "postgresql+asyncpg://pocketpilot:pocketpilot_secret_2024@db:5432/pocketpilot"
    database_url_sync: str = "postgresql://pocketpilot:pocketpilot_secret_2024@db:5432/pocketpilot"
    
    # Redis Cache
    redis_url: str | None = None

    # JWT
    jwt_secret_key: str = "your-super-secret-key-change-in-production-min-32-chars!!"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000", "http://localhost:3001", "http://127.0.0.1:3001", "https://pocketpilot-fin.vercel.app"]

    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000
    
    # LLM APIs
    gemini_api_key: str | None = None
    openai_api_key: str | None = None

settings = Settings()
