"""Analytics API — aggregated dashboard data in a single endpoint."""

from __future__ import annotations

import uuid
from datetime import date, timedelta

from fastapi import APIRouter, Depends, Query, Request, Response
from sqlalchemy import select, func, case, extract, desc, cast, Float
from sqlalchemy.ext.asyncio import AsyncSession
from fastapi_cache.decorator import cache

from app.database import get_db
from app.dependencies import get_current_user
from app.features.users.models import User
from app.features.transactions.models import Transaction

router = APIRouter(prefix="/analytics", tags=["Analytics"])

def user_key_builder(
    func,
    namespace: str = "",
    request: Request = None,
    response: Response = None,
    *args,
    **kwargs,
):
    # fastapi-cache2 passes dependency-injected params in kwargs directly
    user = kwargs.get("current_user")
    user_id = str(user.id) if user else "anonymous"
    return ":".join([namespace, request.method.lower(), request.url.path, user_id])


@router.get("/summary", summary="Get dashboard analytics summary")
@cache(expire=300, key_builder=user_key_builder)
async def get_summary(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Returns a comprehensive analytics summary for the dashboard:
    - total_income, total_expense, savings, transaction_count
    - category_breakdown (list of {category, total, count, percentage})
    - top_merchants (top 5 by total spend)
    - monthly_trends (last 6 months income/expense)
    - recent_transactions (last 5)
    """
    user_id = current_user.id

    # ── Total income / expense ──
    totals_q = select(
        func.coalesce(
            func.sum(
                case(
                    (Transaction.transaction_type == "credit", Transaction.amount),
                    else_=0,
                )
            ),
            0,
        ).label("total_income"),
        func.coalesce(
            func.sum(
                case(
                    (Transaction.transaction_type == "debit", Transaction.amount),
                    else_=0,
                )
            ),
            0,
        ).label("total_expense"),
        func.count(Transaction.id).label("transaction_count"),
    ).where(Transaction.user_id == user_id)

    totals_row = (await db.execute(totals_q)).one()
    total_income = float(totals_row.total_income)
    total_expense = float(totals_row.total_expense)
    savings = total_income - total_expense
    transaction_count = totals_row.transaction_count

    # ── Category breakdown ──
    cat_q = (
        select(
            Transaction.category,
            func.sum(Transaction.amount).label("total"),
            func.count(Transaction.id).label("count"),
        )
        .where(Transaction.user_id == user_id)
        .where(Transaction.transaction_type == "debit")
        .group_by(Transaction.category)
        .order_by(desc("total"))
    )
    cat_rows = (await db.execute(cat_q)).all()

    total_cat_spend = sum(float(r.total) for r in cat_rows) or 1  # avoid div by 0
    category_breakdown = [
        {
            "category": r.category or "Others",
            "total": round(float(r.total), 2),
            "count": r.count,
            "percentage": round(float(r.total) / total_cat_spend * 100, 1),
        }
        for r in cat_rows
    ]

    # ── Top merchants (by debit spend) ──
    merch_q = (
        select(
            Transaction.merchant,
            func.sum(Transaction.amount).label("total"),
            func.count(Transaction.id).label("count"),
        )
        .where(Transaction.user_id == user_id)
        .where(Transaction.transaction_type == "debit")
        .where(Transaction.merchant.isnot(None))
        .where(Transaction.merchant != "")
        .group_by(Transaction.merchant)
        .order_by(desc("total"))
        .limit(5)
    )
    merch_rows = (await db.execute(merch_q)).all()
    top_merchants = [
        {
            "merchant": r.merchant,
            "total": round(float(r.total), 2),
            "count": r.count,
        }
        for r in merch_rows
    ]

    # ── Monthly trends (last 6 months) ──
    six_months_ago = date.today().replace(day=1) - timedelta(days=150)
    trend_q = (
        select(
            extract("year", Transaction.date).label("year"),
            extract("month", Transaction.date).label("month"),
            func.coalesce(
                func.sum(
                    case(
                        (Transaction.transaction_type == "credit", Transaction.amount),
                        else_=0,
                    )
                ),
                0,
            ).label("income"),
            func.coalesce(
                func.sum(
                    case(
                        (Transaction.transaction_type == "debit", Transaction.amount),
                        else_=0,
                    )
                ),
                0,
            ).label("expense"),
        )
        .where(Transaction.user_id == user_id)
        .where(Transaction.date >= six_months_ago)
        .group_by("year", "month")
        .order_by("year", "month")
    )
    trend_rows = (await db.execute(trend_q)).all()

    month_names = [
        "", "Jan", "Feb", "Mar", "Apr", "May", "Jun",
        "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
    ]
    monthly_trends = [
        {
            "month": f"{month_names[int(r.month)]} {int(r.year)}",
            "income": round(float(r.income), 2),
            "expense": round(float(r.expense), 2),
        }
        for r in trend_rows
    ]

    # ── Recent transactions ──
    recent_q = (
        select(Transaction)
        .where(Transaction.user_id == user_id)
        .order_by(Transaction.date.desc(), Transaction.created_at.desc())
        .limit(5)
    )
    recent_rows = (await db.execute(recent_q)).scalars().all()
    recent_transactions = [
        {
            "id": str(t.id),
            "date": t.date.isoformat(),
            "merchant": t.merchant,
            "description": t.description,
            "amount": float(t.amount),
            "transaction_type": t.transaction_type,
            "category": t.category,
        }
        for t in recent_rows
    ]

    return {
        "total_income": round(total_income, 2),
        "total_expense": round(total_expense, 2),
        "savings": round(savings, 2),
        "transaction_count": transaction_count,
        "category_breakdown": category_breakdown,
        "top_merchants": top_merchants,
        "monthly_trends": monthly_trends,
        "recent_transactions": recent_transactions,
    }


@router.get("/intelligent", summary="Get intelligent ML analytics")
@cache(expire=3600, key_builder=user_key_builder)
async def get_intelligent_analytics(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> dict:
    """
    Returns advanced ML-powered analytics:
    - Anomalies (Isolation Forest)
    - Forecasting (Prophet)
    - Health Score
    - Budget Recommendations
    """
    user_id = current_user.id
    
    # 1. Fetch all transactions for ML processing
    txn_q = select(Transaction).where(Transaction.user_id == user_id).order_by(Transaction.date)
    txn_rows = (await db.execute(txn_q)).scalars().all()
    
    transactions = [
        {
            "id": str(t.id),
            "date": t.date.isoformat(),
            "amount": float(t.amount),
            "merchant": t.merchant,
            "category": t.category,
            "transaction_type": t.transaction_type
        }
        for t in txn_rows
    ]
    
    # 2. Get AI Service
    from app.features.analytics import ai_service
    
    # Generate Anomalies
    anomalies = ai_service.detect_anomalies(transactions)
    
    # Generate Forecast
    forecast = ai_service.generate_forecast(transactions)
    
    # 3. Calculate Health Score Inputs
    total_income = sum(t["amount"] for t in transactions if t["transaction_type"] == "credit")
    total_expense = sum(t["amount"] for t in transactions if t["transaction_type"] == "debit")
    
    category_totals = {}
    for t in transactions:
        if t["transaction_type"] == "debit":
            cat = t["category"] or "Others"
            category_totals[cat] = category_totals.get(cat, 0.0) + t["amount"]
            
    health_score = ai_service.calculate_health_score(
        total_income=total_income,
        total_expense=total_expense,
        category_totals=category_totals,
        transaction_count=len(transactions)
    )
    
    # 4. Budget Recommendations (averages based on months)
    budget_recommendations = []
    if transactions:
        from datetime import datetime
        first_date = datetime.fromisoformat(transactions[0]["date"])
        last_date = datetime.fromisoformat(transactions[-1]["date"])
        days = (last_date - first_date).days or 1
        months = max(1, days / 30.0)
        
        for cat, total in category_totals.items():
            if total > 0:
                monthly_avg = total / months
                # Suggest a 5% reduction goal
                recommended_budget = round(monthly_avg * 0.95, 2)
                budget_recommendations.append({
                    "category": cat,
                    "current_avg": round(monthly_avg, 2),
                    "recommended_budget": recommended_budget
                })
        
        budget_recommendations.sort(key=lambda x: x["current_avg"], reverse=True)
        
    return {
        "health_score": health_score,
        "anomalies": anomalies,
        "forecast": forecast,
        "budget_recommendations": budget_recommendations
    }
