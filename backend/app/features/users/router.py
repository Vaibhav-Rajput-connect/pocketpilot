from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.features.users.models import User
from app.features.users.schemas import UserProfileUpdate, UserResponse
from app.features.users import service as user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get(
    "/me",
    response_model=UserResponse,
    summary="Get current user profile",
)
async def get_me(
    current_user: User = Depends(get_current_user),
) -> UserResponse:
    return UserResponse.model_validate(current_user)


@router.put(
    "/profile",
    response_model=UserResponse,
    summary="Update current user profile",
)
async def update_profile(
    data: UserProfileUpdate,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> UserResponse:
    updated = await user_service.update_profile(db, current_user.id, data)
    return UserResponse.model_validate(updated)
