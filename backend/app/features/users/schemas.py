from __future__ import annotations

from datetime import datetime
from uuid import UUID

from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
    id: UUID
    full_name: str
    email: EmailStr
    monthly_income: float | None = None
    currency: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class UserProfileUpdate(BaseModel):
    full_name: str | None = Field(None, min_length=2, max_length=255)
    monthly_income: float | None = Field(None, ge=0, le=999_999_999.99)
    currency: str | None = Field(None, min_length=3, max_length=3, pattern=r"^[A-Z]{3}$")
