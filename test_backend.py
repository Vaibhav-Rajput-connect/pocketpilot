from fastapi.testclient import TestClient
from app.main import app
from app.dependencies import get_current_user
from app.features.users.models import User

def mock_get_current_user():
    return User(id="123e4567-e89b-12d3-a456-426614174000", email="test@test.com", full_name="Test User")

app.dependency_overrides[get_current_user] = mock_get_current_user

with TestClient(app) as client:
    res = client.get("/api/v1/analytics/summary")
    print("Summary Status:", res.status_code)
    print("Summary Body:", res.text)
