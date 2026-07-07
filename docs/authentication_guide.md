# PocketPilot Authentication Guide

PocketPilot secures its API using industry-standard **OAuth2 with Password Flow and Bearer Tokens (JWT)**.

## 1. Registration

To create a new user account, send a `POST` request to `/api/v1/auth/register`.

**Request:**
```bash
curl -X POST "https://api.pocketpilot.app/api/v1/auth/register" \
     -H "Content-Type: application/json" \
     -d '{
       "full_name": "Jane Doe",
       "email": "jane@example.com",
       "password": "securepassword123",
       "monthly_income": 5000,
       "currency": "USD"
     }'
```

**Response (201 Created):**
```json
{
  "id": "uuid-1234",
  "full_name": "Jane Doe",
  "email": "jane@example.com",
  "monthly_income": 5000,
  "currency": "USD"
}
```

## 2. Obtaining an Access Token (Login)

To get an access token, send your credentials as `application/x-www-form-urlencoded` data to `/api/v1/auth/login`.

**Request:**
```bash
curl -X POST "https://api.pocketpilot.app/api/v1/auth/login" \
     -H "Content-Type: application/x-www-form-urlencoded" \
     -d "username=jane@example.com&password=securepassword123"
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR...",
  "token_type": "bearer"
}
```

## 3. Authenticating Requests

For any protected route, you must include the access token in the `Authorization` header.

**Format:**
```
Authorization: Bearer <your_access_token>
```

**Example Request:**
```bash
curl -X GET "https://api.pocketpilot.app/api/v1/users/me" \
     -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR..."
```

If the token is missing, expired, or invalid, you will receive a `401 Unauthorized` response. Tokens expire after 15 minutes by default.
