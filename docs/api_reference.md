# PocketPilot API Reference

This document highlights the core endpoints of the PocketPilot API. For complete details, schemas, and live testing, visit the **Swagger UI** at `https://api.pocketpilot.app/docs`.

## 1. Authentication
* **POST `/api/v1/auth/register`**: Register a new user.
* **POST `/api/v1/auth/login`**: Authenticate and receive a JWT token.

*(See `authentication_guide.md` for detailed examples).*

## 2. Transactions
Manage personal financial transactions.

### Upload Bank Statement (AI Parsing)
* **POST `/api/v1/transactions/upload`**
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: multipart/form-data`
* **Body**: `file` (PDF statement)
* **Description**: Extracts transactions from a PDF statement using Google Gemini and saves them to your account.

**Example:**
```bash
curl -X POST "https://api.pocketpilot.app/api/v1/transactions/upload" \
     -H "Authorization: Bearer eyJhbGci..." \
     -F "file=@/path/to/statement.pdf"
```

### List Transactions
* **GET `/api/v1/transactions/`**
* **Headers**: `Authorization: Bearer <token>`
* **Description**: Retrieve a paginated list of your transactions.

**Example:**
```bash
curl -X GET "https://api.pocketpilot.app/api/v1/transactions/?skip=0&limit=100" \
     -H "Authorization: Bearer eyJhbGci..."
```

## 3. Analytics & Dashboard
Get aggregated insights into your finances.

### Get Summary
* **GET `/api/v1/analytics/summary`**
* **Headers**: `Authorization: Bearer <token>`
* **Description**: Returns total income, total expenses, net savings, and the top spending category for the current month.

**Example Response:**
```json
{
  "total_income": 5400.0,
  "total_expenses": 3200.0,
  "net_savings": 2200.0,
  "top_category": "Food & Dining"
}
```

## 4. AI Copilot
Interact with your personal finance AI.

### Get Financial Advice
* **POST `/api/v1/copilot/chat`**
* **Headers**: `Authorization: Bearer <token>`, `Content-Type: application/json`
* **Body**: `{"message": "How can I reduce my dining expenses?"}`
* **Description**: Chats with the PocketPilot AI, which has context on your recent transactions and spending habits.

### Forecasting
* **GET `/api/v1/copilot/forecast`**
* **Headers**: `Authorization: Bearer <token>`
* **Description**: Uses Facebook Prophet to predict your expenses for the next 30 days based on historical transaction data.
