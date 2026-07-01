from __future__ import annotations

from fastapi import APIRouter, Depends, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.features.auth.schemas import (
    LoginRequest,
    RefreshRequest,
    SignupRequest,
    TokenResponse,
)
from app.features.auth import service as auth_service

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post(
    "/signup",
    response_model=TokenResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new account",
)
async def signup(
    data: SignupRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    tokens = await auth_service.signup(db, data)
    return TokenResponse(**tokens)


@router.post(
    "/login",
    response_model=TokenResponse,
    summary="Authenticate and receive tokens",
)
async def login(
    data: LoginRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    tokens = await auth_service.login(db, data)
    return TokenResponse(**tokens)


@router.post(
    "/refresh",
    response_model=TokenResponse,
    summary="Refresh access token",
)
async def refresh_token(
    data: RefreshRequest,
    db: AsyncSession = Depends(get_db),
) -> TokenResponse:
    tokens = await auth_service.refresh(db, data.refresh_token)
    return TokenResponse(**tokens)
