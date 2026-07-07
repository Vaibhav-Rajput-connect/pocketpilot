import pytest
from httpx import AsyncClient
from unittest.mock import AsyncMock

from app.features.users.models import User
from app.features.auth.utils import get_password_hash

@pytest.mark.asyncio
async def test_register_user(client: AsyncClient, mock_db_session: AsyncMock):
    """Test user registration endpoint."""
    response = await client.post(
        "/api/v1/auth/register",
        json={
            "full_name": "Test User",
            "email": "test@example.com",
            "password": "password123",
            "monthly_income": 5000,
            "currency": "USD"
        }
    )
    
    # Since DB is mocked, it will return 201 created.
    assert response.status_code == 201
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["full_name"] == "Test User"
    assert "password_hash" not in data

@pytest.mark.asyncio
async def test_login_user(client: AsyncClient, mock_db_session: AsyncMock):
    """Test user login endpoint."""
    # Mock finding a user in the database
    hashed_password = get_password_hash("password123")
    mock_user = User(
        id="12345678-1234-5678-1234-567812345678",
        full_name="Test User",
        email="test@example.com",
        password_hash=hashed_password
    )
    mock_db_session.execute.return_value.scalar_one_or_none.return_value = mock_user

    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": "test@example.com",
            "password": "password123"
        }
    )
    
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_user_wrong_password(client: AsyncClient, mock_db_session: AsyncMock):
    """Test login with incorrect password."""
    hashed_password = get_password_hash("password123")
    mock_user = User(
        id="12345678-1234-5678-1234-567812345678",
        full_name="Test User",
        email="test@example.com",
        password_hash=hashed_password
    )
    mock_db_session.execute.return_value.scalar_one_or_none.return_value = mock_user

    response = await client.post(
        "/api/v1/auth/login",
        data={
            "username": "test@example.com",
            "password": "wrongpassword"
        }
    )
    
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect email or password"
