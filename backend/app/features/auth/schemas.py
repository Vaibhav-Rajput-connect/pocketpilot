from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, field_validator
import re


class SignupRequest(BaseModel):
    full_name: str = Field(..., min_length=2, max_length=255, examples=["Jane Doe"])
    email: EmailStr = Field(..., examples=["jane@example.com"])
    password: str = Field(..., min_length=8, max_length=128)

    @field_validator("password")
    @classmethod
    def validate_password_strength(cls, v: str) -> str:
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must contain at least one uppercase letter.")
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must contain at least one lowercase letter.")
        if not re.search(r"\d", v):
            raise ValueError("Password must contain at least one digit.")
        if not re.search(r"[!@#$%^&*(),.?\":{}|<>]", v):
            raise ValueError("Password must contain at least one special character.")
        return v

    @field_validator("full_name")
    @classmethod
    def validate_full_name(cls, v: str) -> str:
        return v.strip()


class LoginRequest(BaseModel):
    email: EmailStr = Field(..., examples=["jane@example.com"])
    password: str = Field(..., min_length=1, max_length=128)


class RefreshRequest(BaseModel):
    refresh_token: str = Field(..., min_length=1)


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
