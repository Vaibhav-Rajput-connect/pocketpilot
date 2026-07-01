from __future__ import annotations

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import ConflictException, UnauthorizedException
from app.features.auth.schemas import SignupRequest, LoginRequest
from app.features.auth.security import (
    create_token_pair,
    decode_token,
    hash_password,
    verify_password,
)
from app.features.users.models import User


async def signup(db: AsyncSession, data: SignupRequest) -> dict[str, str]:
    stmt = select(User).where(User.email == data.email.lower())
    result = await db.execute(stmt)
    if result.scalar_one_or_none() is not None:
        raise ConflictException(detail="An account with this email already exists.")

    user = User(
        full_name=data.full_name,
        email=data.email.lower(),
        password_hash=hash_password(data.password),
    )
    db.add(user)
    await db.flush()

    return create_token_pair(user.id)


async def login(db: AsyncSession, data: LoginRequest) -> dict[str, str]:
    stmt = select(User).where(User.email == data.email.lower())
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None or not verify_password(data.password, user.password_hash):
        raise UnauthorizedException(detail="Invalid email or password.")

    return create_token_pair(user.id)


async def refresh(db: AsyncSession, refresh_token: str) -> dict[str, str]:
    user_id = decode_token(refresh_token, expected_type="refresh")

    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()

    if user is None:
        raise UnauthorizedException(detail="User no longer exists.")

    return create_token_pair(user.id)
