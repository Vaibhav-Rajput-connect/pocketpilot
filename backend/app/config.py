from __future__ import annotations

from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        case_sensitive=False,
        extra="ignore",
    )

    # Database
    database_url: str = "postgresql+asyncpg://pocketpilot:pocketpilot_secret_2024@db:5432/pocketpilot"
    database_url_sync: str = "postgresql://pocketpilot:pocketpilot_secret_2024@db:5432/pocketpilot"

    # JWT
    jwt_secret_key: str = "your-super-secret-key-change-in-production-min-32-chars!!"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 15
    refresh_token_expire_days: int = 7

    # CORS
    cors_origins: list[str] = ["http://localhost:3000", "http://127.0.0.1:3000"]

    # Server
    backend_host: str = "0.0.0.0"
    backend_port: int = 8000


settings = Settings()
