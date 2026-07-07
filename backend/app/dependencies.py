from __future__ import annotations

from fastapi import Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.features.auth.security import decode_token
from app.features.users.models import User
from app.features.users import service as user_service
from app.exceptions import UnauthorizedException


async def get_current_user(
    request: Request,
    db: AsyncSession = Depends(get_db),
) -> User:
    token = request.cookies.get("access_token")
    if not token:
        # Fallback to Authorization header for non-browser clients (like mobile app or swagger UI)
        auth_header = request.headers.get("Authorization")
        if auth_header and auth_header.startswith("Bearer "):
            token = auth_header.split(" ")[1]
        
    if not token:
        raise UnauthorizedException("Not authenticated")
        
    user_id = decode_token(token, expected_type="access")
    return await user_service.get_by_id(db, user_id)
