"""Machine Learning and Intelligent Analytics Service."""

from __future__ import annotations
import logging
from datetime import date, timedelta, datetime
from typing import Any
import statistics

logger = logging.getLogger(__name__)


def detect_anomalies(transactions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Uses the Interquartile Range (IQR) method in pure Python to detect anomalous transaction amounts.
    Only considers debit transactions.
    """
    debits = [t for t in transactions if t.get("transaction_type") == "debit" and t.get("amount", 0) > 0]
    
    if len(debits) < 10:
        return []  # Not enough data for meaningful anomaly detection

    # Sort amounts to calculate IQR
    amounts = sorted([float(t["amount"]) for t in debits])
    n = len(amounts)
    
    # Calculate Q1, Q3, and IQR
    q1 = amounts[n // 4]
    q3 = amounts[(n * 3) // 4]
    iqr = q3 - q1
    
    # Define an anomaly as being greater than Q3 + 2.5 * IQR (using 2.5 instead of 1.5 for stricter anomalies)
    upper_bound = q3 + 2.5 * iqr
    
    # Filter anomalous transactions
    anomalies = []
    for t in debits:
        amt = float(t.get("amount", 0.0))
        if amt > upper_bound and amt > statistics.median(amounts):
            anomalies.append({
                "id": t.get("id", ""),
                "date": t.get("date"),
                "merchant": t.get("merchant", "Unknown"),
                "amount": amt,
                "reason": "Unusually large transaction amount"
            })
            
    # Sort by amount descending
    anomalies.sort(key=lambda x: x["amount"], reverse=True)
    return anomalies


def generate_forecast(transactions: list[dict[str, Any]], months_to_forecast: int = 3) -> dict[str, Any]:
    """
    Uses simple pure Python statistics to forecast future expenses based on historical weekly averages.
    """
    debits = [t for t in transactions if t.get("transaction_type") == "debit"]
    if len(debits) < 14:
        return {"historical": [], "forecast": []}
        
    # Group amounts by ISO week string (YYYY-WW)
    weekly_totals = {}
    for t in debits:
        dt = datetime.strptime(t.get("date").split("T")[0], "%Y-%m-%d")
        week_str = f"{dt.year}-W{dt.isocalendar()[1]:02d}"
        weekly_totals[week_str] = weekly_totals.get(week_str, 0.0) + float(t.get("amount", 0.0))
        
    sorted_weeks = sorted(weekly_totals.keys())
    
    # Format Historical (Actuals)
    historical_data = []
    for w in sorted_weeks:
        # Just use the Monday of that week as the date
        year, week = int(w.split('-W')[0]), int(w.split('-W')[1])
        # A hacky way to get a date from year and week number in pure python
        monday = datetime.strptime(f"{year}-W{week}-1", "%G-W%V-%u").strftime("%Y-%m-%d")
        historical_data.append({
            "date": monday,
            "actual": round(weekly_totals[w], 2)
        })
        
    # Forecast future weeks (4 weeks per month)
    num_weeks_to_forecast = months_to_forecast * 4
    if len(historical_data) == 0:
         return {"historical": [], "forecast": []}
         
    # Calculate simple moving average of the last 4 weeks (or less if not available)
    recent_totals = [d["actual"] for d in historical_data[-4:]]
    avg_weekly = statistics.mean(recent_totals) if recent_totals else 0.0
    
    # Calculate variance to give upper/lower bounds
    std_dev = statistics.stdev(recent_totals) if len(recent_totals) > 1 else avg_weekly * 0.1
    
    forecast_data = []
    last_date = datetime.strptime(historical_data[-1]["date"], "%Y-%m-%d")
    
    for i in range(1, num_weeks_to_forecast + 1):
        next_date = (last_date + timedelta(weeks=i)).strftime("%Y-%m-%d")
        pred = avg_weekly
        lower = max(0.0, pred - std_dev)
        upper = pred + std_dev
        
        forecast_data.append({
            "date": next_date,
            "predicted": round(pred, 2),
            "lower_bound": round(lower, 2),
            "upper_bound": round(upper, 2)
        })
            
    return {
        "historical": historical_data,
        "forecast": forecast_data
    }


def calculate_health_score(
    total_income: float, 
    total_expense: float, 
    category_totals: dict[str, float],
    transaction_count: int
) -> dict[str, Any]:
    """
    Calculates a 0-100 financial health score.
    """
    if total_income == 0 and total_expense == 0:
        return {"score": 0, "status": "No Data", "insights": ["Add some transactions to get a health score!"]}
        
    score = 50.0 # Base score
    insights = []
    
    # 1. Savings Rate (40 points max)
    savings_rate = 0.0
    if total_income > 0:
        savings = total_income - total_expense
        savings_rate = savings / total_income
        
        if savings_rate > 0.30:
            score += 40
            insights.append({"type": "positive", "text": "Excellent savings rate! You are saving over 30% of your income."})
        elif savings_rate > 0.15:
            score += 30
            insights.append({"type": "positive", "text": "Good savings rate. You are saving a healthy portion of your income."})
        elif savings_rate > 0:
            score += 15
            insights.append({"type": "warning", "text": "You are saving, but try to aim for at least 15-20% of your income."})
        else:
            score -= 20 # Penalty for overspending
            insights.append({"type": "negative", "text": "You are spending more than you earn! Look for areas to cut back."})
    elif total_expense > 0:
        # No income, only expense
        score -= 20
        insights.append({"type": "negative", "text": "No income recorded. You are currently running a deficit."})
        
    # 2. Category Diversity & Necessities vs Wants (30 points)
    # Estimate necessities based on categories
    necessities = sum(category_totals.get(cat, 0.0) for cat in ["Housing", "Utilities", "Groceries", "Healthcare", "Transport"])
    
    if total_expense > 0:
        necessity_ratio = necessities / total_expense
        if necessity_ratio < 0.50:
            score += 15
            insights.append({"type": "positive", "text": "Your essential living costs are well below 50% of your expenses."})
        elif necessity_ratio > 0.70:
            score -= 10
            insights.append({"type": "warning", "text": "A large portion of your budget goes to necessities. You might be house-poor."})
            
    # 3. Emergency Fund Estimate (30 points)
    # If the user has saved more than 3x their average monthly expense, we assume they have an emergency fund.
    if total_expense > 0 and transaction_count > 30:
        # Very rough heuristic: net savings across the dataset vs total expense
        net_savings = total_income - total_expense
        avg_monthly_expense = total_expense / max(1, (transaction_count / 30))
        
        if net_savings >= avg_monthly_expense * 3:
            score += 30
            insights.append({"type": "positive", "text": "Your total savings suggest a healthy emergency fund (3+ months of expenses)."})
        elif net_savings >= avg_monthly_expense:
            score += 15
            insights.append({"type": "warning", "text": "Your emergency fund is growing, but aim for 3-6 months of living expenses."})
        else:
            insights.append({"type": "negative", "text": "Your savings are low. Prioritize building an emergency fund of at least 3 months expenses."})
            
    # Clamp score
    final_score = max(0, min(100, int(score)))
    
    status = "Poor"
    if final_score >= 80:
        status = "Excellent"
    elif final_score >= 60:
        status = "Good"
    elif final_score >= 40:
        status = "Fair"
        
    return {
        "score": final_score,
        "status": status,
        "insights": insights
    }
