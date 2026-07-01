from __future__ import annotations

from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.exceptions import NotFoundException
from app.features.users.models import User
from app.features.users.schemas import UserProfileUpdate


async def get_by_id(db: AsyncSession, user_id: UUID) -> User:
    stmt = select(User).where(User.id == user_id)
    result = await db.execute(stmt)
    user = result.scalar_one_or_none()
    if user is None:
        raise NotFoundException(detail="User not found.")
    return user


async def update_profile(
    db: AsyncSession,
    user_id: UUID,
    data: UserProfileUpdate,
) -> User:
    user = await get_by_id(db, user_id)

    update_data = data.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)

    await db.flush()
    await db.refresh(user)
    return user
