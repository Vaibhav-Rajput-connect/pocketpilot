import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_health_live(client: AsyncClient):
    """Test the liveness probe."""
    response = await client.get("/health/live")
    assert response.status_code == 200
    assert response.json() == {"status": "alive"}

@pytest.mark.asyncio
async def test_health_ready(client: AsyncClient):
    """Test the readiness probe."""
    response = await client.get("/health/ready")
    assert response.status_code == 200
    assert response.json() == {"status": "ready"}

@pytest.mark.asyncio
async def test_metrics(client: AsyncClient):
    """Test the Prometheus metrics endpoint."""
    response = await client.get("/metrics")
    assert response.status_code == 200
    assert "http_request_duration_seconds" in response.text
