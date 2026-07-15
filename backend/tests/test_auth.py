import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock

from app.features.users.models import User
from app.features.auth.security import hash_password

class MockResult:
    def __init__(self, obj):
        self.obj = obj
    def scalar_one_or_none(self):
        return self.obj

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, mock_db_session: AsyncMock):
    """Test user registration endpoint."""
    mock_db_session.execute.return_value = MockResult(None)
    response = await client.post(
        "/api/v1/auth/signup",
        json={
            "full_name": "Test User",
            "email": "test@example.com",
            "password": "Password123!"
        }
    )
    
    # Since DB is mocked, it will return 201 created.
    assert response.status_code == 201
    data = response.json()
    assert data["status"] == "success"
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies

@pytest.mark.asyncio
async def test_login_user(client: AsyncClient, mock_db_session: AsyncMock):
    """Test user login endpoint."""
    # Mock finding a user in the database
    hashed_password = hash_password("Password123!")
    mock_user = User(
        id="12345678-1234-5678-1234-567812345678",
        full_name="Test User",
        email="test@example.com",
        password_hash=hashed_password
    )
    mock_db_session.execute.return_value = MockResult(mock_user)

    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "Password123!"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"
    assert "access_token" in response.cookies
    assert "refresh_token" in response.cookies

@pytest.mark.asyncio
async def test_login_user_wrong_password(client: AsyncClient, mock_db_session: AsyncMock):
    """Test login with incorrect password."""
    hashed_password = hash_password("Password123!")
    mock_user = User(
        id="12345678-1234-5678-1234-567812345678",
        full_name="Test User",
        email="test@example.com",
        password_hash=hashed_password
    )
    mock_db_session.execute.return_value = MockResult(mock_user)

    response = await client.post(
        "/api/v1/auth/login",
        json={
            "email": "test@example.com",
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password."
