"""Machine Learning and Intelligent Analytics Service."""

from __future__ import annotations
import logging
from datetime import date, timedelta
from typing import Any

import pandas as pd
from sklearn.ensemble import IsolationForest
try:
    from prophet import Prophet
except ImportError:
    Prophet = None

logger = logging.getLogger(__name__)


def detect_anomalies(transactions: list[dict[str, Any]]) -> list[dict[str, Any]]:
    """
    Uses Isolation Forest to detect anomalous transaction amounts.
    Only considers debit transactions.
    """
    debits = [t for t in transactions if t.get("transaction_type") == "debit" and t.get("amount", 0) > 0]
    
    if len(debits) < 10:
        return []  # Not enough data for meaningful anomaly detection

    # Prepare DataFrame
    df = pd.DataFrame(debits)
    
    # We use log of amount to handle large disparities in transaction sizes
    import numpy as np
    X = np.log1p(df[['amount']].values)
    
    # Train Isolation Forest
    # contamination=0.05 means we expect ~5% of transactions to be outliers
    model = IsolationForest(contamination=0.05, random_state=42)
    df['anomaly'] = model.fit_predict(X)
    
    # -1 means anomaly, 1 means normal
    anomalies = df[df['anomaly'] == -1].copy()
    
    # To avoid flagging very small transactions as anomalies, we only flag
    # if the amount is greater than the median of all transactions.
    median_amt = df['amount'].median()
    anomalies = anomalies[anomalies['amount'] > median_amt]
    
    # Format for output
    results = []
    for _, row in anomalies.iterrows():
        results.append({
            "id": row.get("id", ""),
            "date": row.get("date"),
            "merchant": row.get("merchant", "Unknown"),
            "amount": row.get("amount", 0.0),
            "reason": "Unusually large transaction amount"
        })
        
    # Sort by amount descending
    results.sort(key=lambda x: x["amount"], reverse=True)
    return results


def generate_forecast(transactions: list[dict[str, Any]], months_to_forecast: int = 3) -> dict[str, Any]:
    """
    Uses Prophet to forecast future expenses based on historical data.
    Groups data by week to smooth noise.
    """
    if Prophet is None:
        logger.warning("Prophet is not installed. Forecasting disabled.")
        return {"historical": [], "forecast": []}
        
    debits = [t for t in transactions if t.get("transaction_type") == "debit"]
    if len(debits) < 14:
        # Not enough data for meaningful forecasting
        return {"historical": [], "forecast": []}
        
    df = pd.DataFrame(debits)
    
    # Prophet requires 'ds' (datetime) and 'y' (value) columns
    df['ds'] = pd.to_datetime(df['date'])
    df['y'] = df['amount']
    
    # Group by Week to smooth out daily variance
    weekly_df = df.resample('W-MON', on='ds').sum().reset_index()
    weekly_df = weekly_df[['ds', 'y']]
    
    # If we have less than 4 weeks of data, Prophet will struggle
    if len(weekly_df) < 4:
        return {"historical": [], "forecast": []}
        
    # Train Prophet Model
    model = Prophet(
        yearly_seasonality=False,
        weekly_seasonality=True,
        daily_seasonality=False,
        changepoint_prior_scale=0.05
    )
    # Suppress cmdstanpy logging if possible
    model.fit(weekly_df)
    
    # Predict future weeks (4 weeks per month)
    future = model.make_future_dataframe(periods=months_to_forecast * 4, freq='W-MON')
    forecast = model.predict(future)
    
    # Format Historical (Actuals)
    historical_data = []
    for _, row in weekly_df.iterrows():
        historical_data.append({
            "date": row['ds'].strftime("%Y-%m-%d"),
            "actual": round(float(row['y']), 2)
        })
        
    # Format Forecast
    forecast_data = []
    for _, row in forecast.iterrows():
        # Only include future dates (or very recent ones)
        if row['ds'] >= weekly_df['ds'].max():
            # Prophet might predict negative amounts, clamp to 0
            pred = max(0, float(row['yhat']))
            lower = max(0, float(row['yhat_lower']))
            upper = max(0, float(row['yhat_upper']))
            
            forecast_data.append({
                "date": row['ds'].strftime("%Y-%m-%d"),
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
