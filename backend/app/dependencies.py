from __future__ import annotations

from fastapi import Depends
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.features.auth.security import decode_token
from app.features.users.models import User
from app.features.users import service as user_service

bearer_scheme = HTTPBearer(auto_error=True)


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: AsyncSession = Depends(get_db),
) -> User:
    user_id = decode_token(credentials.credentials, expected_type="access")
    return await user_service.get_by_id(db, user_id)
