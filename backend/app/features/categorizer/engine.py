"""
AI-powered transaction categorization engine.

Uses a keyword-based classifier that works immediately without training data.
Architecture is designed to be swappable with a scikit-learn ML model once
enough manually-corrected labels accumulate.
"""

from __future__ import annotations

import re
import logging
from typing import Optional

logger = logging.getLogger(__name__)

# ── Category definitions ──
CATEGORIES = [
    "Food",
    "Transport",
    "Shopping",
    "Bills",
    "Entertainment",
    "Healthcare",
    "Salary",
    "Investment",
    "Education",
    "Travel",
    "Others",
]

# ── Keyword maps ──
# Each category maps to a list of lowercase keywords/patterns that are matched
# against the combined merchant + description text.

KEYWORD_MAP: dict[str, list[str]] = {
    "Food": [
        "zomato", "swiggy", "dominos", "pizza", "burger", "mcdonald",
        "kfc", "subway", "restaurant", "cafe", "coffee", "starbucks",
        "dunkin", "food", "eat", "dining", "bakery", "biryani",
        "chicken", "meal", "lunch", "dinner", "breakfast", "snack",
        "haldiram", "barbeque", "bbq", "kitchen", "dhaba", "canteen",
        "mess", "tiffin", "maggi", "noodles", "ice cream", "dessert",
        "juice", "tea", "chaiwala", "paneer", "thali",
    ],
    "Transport": [
        "uber", "ola", "rapido", "lyft", "cab", "taxi", "auto",
        "rickshaw", "metro", "bus", "train", "irctc", "railway",
        "petrol", "diesel", "fuel", "gas station", "parking",
        "toll", "fastag", "transport", "ride", "commute",
        "flight", "indigo", "spicejet", "vistara", "air india",
    ],
    "Shopping": [
        "amazon", "flipkart", "myntra", "ajio", "meesho", "snapdeal",
        "shoppers stop", "westside", "zara", "h&m", "uniqlo",
        "reliance", "dmart", "bigbasket", "blinkit", "zepto",
        "instamart", "jiomart", "grofers", "market", "mall",
        "store", "shop", "purchase", "buy", "retail", "clothing",
        "fashion", "shoes", "electronics", "gadget", "mobile",
        "phone", "laptop", "accessories", "nykaa", "purplle",
    ],
    "Bills": [
        "electricity", "electric", "power", "water", "gas bill",
        "broadband", "internet", "wifi", "jio", "airtel", "vi ",
        "vodafone", "bsnl", "recharge", "mobile bill", "phone bill",
        "rent", "maintenance", "society", "emi", "loan", "insurance",
        "premium", "lic", "policy", "postpaid", "prepaid",
        "dth", "tata play", "dish tv", "subscription",
    ],
    "Entertainment": [
        "netflix", "hotstar", "prime video", "spotify", "youtube",
        "disney", "zee5", "sonyliv", "jiocinema", "apple music",
        "movie", "cinema", "pvr", "inox", "multiplex", "theatre",
        "game", "gaming", "steam", "playstation", "xbox",
        "concert", "event", "ticket", "bookmyshow", "amusement",
        "park", "fun", "club", "pub", "bar", "party",
    ],
    "Healthcare": [
        "hospital", "clinic", "doctor", "medical", "medicine",
        "pharmacy", "pharma", "apollo", "medplus", "netmeds",
        "1mg", "practo", "diagnostic", "lab", "test", "health",
        "dental", "eye", "optical", "gym", "fitness", "yoga",
        "wellness", "therapy", "physiotherapy", "ayurveda",
    ],
    "Salary": [
        "salary", "payroll", "wages", "stipend", "income",
        "credit salary", "monthly pay", "compensation",
        "bonus", "incentive", "commission", "freelance pay",
        "neft salary", "imps salary",
    ],
    "Investment": [
        "mutual fund", "sip", "stock", "share", "demat",
        "zerodha", "groww", "upstox", "angel", "kuvera",
        "investment", "dividend", "interest", "fd ", "fixed deposit",
        "rd ", "recurring deposit", "ppf", "nps", "gold",
        "crypto", "bitcoin", "trading", "broker",
    ],
    "Education": [
        "school", "college", "university", "tuition", "coaching",
        "course", "udemy", "coursera", "edx", "unacademy",
        "byju", "vedantu", "exam", "fee", "fees", "book",
        "stationery", "library", "education", "study",
        "scholarship", "student", "academic",
    ],
    "Travel": [
        "hotel", "oyo", "airbnb", "booking.com", "trivago",
        "makemytrip", "goibibo", "cleartrip", "yatra", "ixigo",
        "travel", "trip", "tour", "holiday", "vacation",
        "resort", "homestay", "luggage", "passport", "visa",
        "cruise", "sightseeing",
    ],
}


def categorize_transaction(
    merchant: str | None,
    description: str | None,
    amount: float | None = None,
    transaction_type: str | None = None,
) -> str:
    """
    Categorize a transaction based on merchant name and description.

    Uses keyword matching against curated category keyword maps.
    Returns one of the predefined CATEGORIES strings.
    """
    # Combine merchant and description into a single searchable text
    text = " ".join(filter(None, [merchant, description])).lower()

    if not text.strip():
        return "Others"

    # Score each category by counting keyword matches
    best_category = "Others"
    best_score = 0

    for category, keywords in KEYWORD_MAP.items():
        score = 0
        for keyword in keywords:
            if keyword in text:
                # Longer keyword matches are worth more (more specific)
                score += len(keyword)
        if score > best_score:
            best_score = score
            best_category = category

    # Special heuristic: large credits without other matches are likely Salary
    if (
        best_category == "Others"
        and transaction_type == "credit"
        and amount is not None
        and amount >= 5000
    ):
        best_category = "Salary"

    return best_category


def categorize_batch(
    transactions: list[dict],
) -> list[str]:
    """
    Categorize a batch of transactions.

    Each dict should have keys: merchant, description, amount, transaction_type.
    Returns a list of category strings in the same order.
    """
    return [
        categorize_transaction(
            merchant=t.get("merchant"),
            description=t.get("description"),
            amount=t.get("amount"),
            transaction_type=t.get("transaction_type"),
        )
        for t in transactions
    ]
