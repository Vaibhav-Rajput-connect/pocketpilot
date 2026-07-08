from fastapi import APIRouter, Depends, BackgroundTasks
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from pydantic import BaseModel

from app.database import get_db
from app.dependencies import get_current_user
from app.features.users.models import User
from app.features.transactions.models import Transaction
from app.features.copilot import ai

router = APIRouter(prefix="/copilot", tags=["Copilot"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    query: str
    history: list[ChatMessage] = []

@router.post("/chat")
async def chat(
    request: ChatRequest,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Streams the LLM response for a chat query using SSE.
    Initializes the user's FAISS index if it doesn't exist.
    """
    import json

    user_id = str(current_user.id)
    
    try:
        # Calculate global totals for the AI context
        txn_q_all = select(Transaction).where(Transaction.user_id == current_user.id).order_by(Transaction.date.desc())
        txn_rows = (await db.execute(txn_q_all)).scalars().all()
        
        # Ensure index exists
        if ai.get_user_index(user_id) is None:
            transactions = [
                {
                    "id": str(t.id),
                    "date": t.date.isoformat(),
                    "amount": float(t.amount),
                    "merchant": t.merchant,
                    "category": t.category,
                    "transaction_type": t.transaction_type,
                    "description": t.description
                }
                for t in txn_rows
            ]
            ai.build_user_index(user_id, transactions)
            
        total_income = sum(float(t.amount) for t in txn_rows if t.transaction_type == 'credit')
        total_expense = sum(float(t.amount) for t in txn_rows if t.transaction_type == 'debit')
        net_savings = total_income - total_expense
        
        summary_context = f"- Total Income: ₹{total_income:,.2f}\n- Total Expense: ₹{total_expense:,.2f}\n- Net Savings: ₹{net_savings:,.2f}\n- Total Transactions: {len(txn_rows)}"
            
        # Convert history
        history_dict = [{"role": msg.role, "content": msg.content} for msg in request.history]

        return StreamingResponse(
            ai.stream_chat_response(user_id, request.query, history_dict, summary_context=summary_context),
            media_type="text/event-stream"
        )
    except Exception as e:
        async def error_stream():
            data = json.dumps({"text": f"Error: {str(e)}. Please check the backend configuration."})
            yield f"data: {data}\n\n"
            yield "data: [DONE]\n\n"
        
        return StreamingResponse(error_stream(), media_type="text/event-stream")

@router.post("/reindex")
async def reindex_transactions(
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    """
    Manually triggers a rebuild of the user's FAISS index in the background.
    """
    user_id = str(current_user.id)
    txn_q = select(Transaction).where(Transaction.user_id == current_user.id).order_by(Transaction.date.desc())
    txn_rows = (await db.execute(txn_q)).scalars().all()
    transactions = [
        {
            "id": str(t.id),
            "date": t.date.isoformat(),
            "amount": float(t.amount),
            "merchant": t.merchant,
            "category": t.category,
            "transaction_type": t.transaction_type,
            "description": t.description
        }
        for t in txn_rows
    ]
    background_tasks.add_task(ai.build_user_index, user_id, transactions)
    
    return {"message": "Reindexing started in background"}
