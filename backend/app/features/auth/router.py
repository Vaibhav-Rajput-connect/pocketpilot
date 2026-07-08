from __future__ import annotations

import logging
from fastapi import APIRouter, Depends, Response, Request, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.config import settings
from app.features.auth.schemas import (
    LoginRequest,
    RefreshRequest,
    SignupRequest,
    TokenResponse,
)
from app.features.auth import service as auth_service
from app.exceptions import UnauthorizedException

router = APIRouter(prefix="/auth", tags=["Authentication"])

logger = logging.getLogger(__name__)

def set_auth_cookies(response: Response, tokens: dict[str, str]) -> None:
    """Helper to set secure HTTP-only cookies."""
    secure_cookie = settings.environment.lower() == "prod"
    samesite_policy = "none" if secure_cookie else "lax"
    
    response.set_cookie(
        key="access_token",
        value=tokens["access_token"],
        httponly=True,
        secure=secure_cookie,
        samesite=samesite_policy,
        path="/",
        max_age=settings.access_token_expire_minutes * 60,
    )
    response.set_cookie(
        key="refresh_token",
        value=tokens["refresh_token"],
        httponly=True,
        secure=secure_cookie,
        samesite=samesite_policy,
        path="/",
        max_age=settings.refresh_token_expire_days * 24 * 60 * 60,
    )


@router.post(
    "/signup",
    response_model=dict,
    status_code=status.HTTP_201_CREATED,
    summary="Register a new account",
)
async def signup(
    data: SignupRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> dict:
    tokens = await auth_service.signup(db, data)
    set_auth_cookies(response, tokens)
    return {"status": "success", "message": "Account created successfully"}


@router.post(
    "/login",
    response_model=dict,
    summary="Authenticate and receive tokens via cookies",
)
async def login(
    data: LoginRequest,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> dict:
    tokens = await auth_service.login(db, data)
    set_auth_cookies(response, tokens)
    return {"status": "success", "message": "Logged in successfully"}


@router.post(
    "/refresh",
    response_model=dict,
    summary="Refresh access token via cookies",
)
async def refresh_token(
    request: Request,
    response: Response,
    db: AsyncSession = Depends(get_db),
) -> dict:
    refresh_token = request.cookies.get("refresh_token")
    if not refresh_token:
        raise UnauthorizedException("No refresh token provided in cookies.")
        
    tokens = await auth_service.refresh(db, refresh_token)
    set_auth_cookies(response, tokens)
    return {"status": "success", "message": "Tokens refreshed successfully"}


@router.post(
    "/logout",
    response_model=dict,
    summary="Logout and clear auth cookies",
)
async def logout(response: Response) -> dict:
    secure_cookie = settings.environment.lower() == "prod"
    samesite_policy = "none" if secure_cookie else "lax"
    response.delete_cookie(key="access_token", httponly=True, samesite=samesite_policy, path="/", secure=secure_cookie)
    response.delete_cookie(key="refresh_token", httponly=True, samesite=samesite_policy, path="/", secure=secure_cookie)
    return {"status": "success", "message": "Logged out successfully"}
