import os
os.environ["REDIS_URL"] = ""

import pytest
from httpx import AsyncClient, ASGITransport
from typing import AsyncGenerator
from unittest.mock import AsyncMock

from app.config import settings
settings.redis_url = None
settings.database_url = "postgresql+asyncpg://mock:mock@localhost:5432/mock"

from app.main import app
from app.database import get_db

@pytest.fixture
async def mock_db_session():
    """Mock database session to avoid hitting a real DB in unit tests."""
    session = AsyncMock()
    # By default, scalar_one_or_none returns None (user not found)
    session.execute.return_value.scalar_one_or_none.return_value = None
    return session

@pytest.fixture
async def client(mock_db_session) -> AsyncGenerator[AsyncClient, None]:
    """Test client with mocked database dependencies."""
    async def override_get_db():
        yield mock_db_session

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
