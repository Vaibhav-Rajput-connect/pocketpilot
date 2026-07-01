from __future__ import annotations

from datetime import datetime, timedelta, timezone
from uuid import UUID

from jose import JWTError, jwt
import bcrypt

from app.config import settings
from app.exceptions import UnauthorizedException

def hash_password(password: str) -> str:
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password.encode("utf-8"), salt).decode("utf-8")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def create_access_token(user_id: UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        minutes=settings.access_token_expire_minutes
    )
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "access",
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def create_refresh_token(user_id: UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(
        days=settings.refresh_token_expire_days
    )
    payload = {
        "sub": str(user_id),
        "exp": expire,
        "type": "refresh",
    }
    return jwt.encode(payload, settings.jwt_secret_key, algorithm=settings.jwt_algorithm)


def decode_token(token: str, expected_type: str = "access") -> UUID:
    """Decode and validate a JWT token, returning the user UUID."""
    try:
        payload = jwt.decode(
            token,
            settings.jwt_secret_key,
            algorithms=[settings.jwt_algorithm],
        )
    except JWTError:
        raise UnauthorizedException(detail="Invalid or expired token.")

    token_type = payload.get("type")
    if token_type != expected_type:
        raise UnauthorizedException(detail=f"Expected {expected_type} token.")

    sub: str | None = payload.get("sub")
    if sub is None:
        raise UnauthorizedException(detail="Token missing subject.")

    try:
        return UUID(sub)
    except ValueError:
        raise UnauthorizedException(detail="Invalid token subject.")


def create_token_pair(user_id: UUID) -> dict[str, str]:
    return {
        "access_token": create_access_token(user_id),
        "refresh_token": create_refresh_token(user_id),
        "token_type": "bearer",
    }
