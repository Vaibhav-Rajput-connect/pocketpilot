from __future__ import annotations

import hashlib
import re
from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import date, datetime
from typing import Optional


@dataclass
class RawTransaction:
    """Normalized transaction output from any parser."""

    date: date
    merchant: str
    description: str
    amount: float
    transaction_type: str  # "debit" or "credit"
    raw_line: str = ""

    @property
    def hash(self) -> str:
        """SHA256 hash for deduplication based on date + amount + description."""
        raw = f"{self.date.isoformat()}|{self.amount:.2f}|{self.description}|{self.transaction_type}"
        return hashlib.sha256(raw.encode()).hexdigest()


class BaseParser(ABC):
    """Abstract base class for all statement parsers."""

    @abstractmethod
    def parse(self, file_bytes: bytes, filename: str) -> list[RawTransaction]:
        """Parse file bytes and return a list of normalized transactions."""
        ...


# ── Column name fuzzy matching ──

DATE_PATTERNS = re.compile(
    r"(?i)\b(date|d/m/y)\b",
)
DESC_PATTERNS = re.compile(
    r"(?i)\b(description|narration|particulars|details|remarks|memo|desc|ref\s*no|reference|chq)\b",
)
DEBIT_PATTERNS = re.compile(
    r"(?i)\b(debit|withdrawal|dr|paid\s*out|money\s*out|withdrawn)\b",
)
CREDIT_PATTERNS = re.compile(
    r"(?i)\b(credit|deposit|cr|paid\s*in|money\s*in|lodgement)\b",
)
AMOUNT_PATTERNS = re.compile(
    r"(?i)\b(amount|total|value|amt|balance)\b",
)
MERCHANT_PATTERNS = re.compile(
    r"(?i)\b(merchant|payee|vendor|beneficiary|receiver|to|from)\b",
)


def detect_columns(headers: list[str]) -> dict[str, Optional[int]]:
    """Detect column indices from header row using fuzzy matching."""
    mapping: dict[str, Optional[int]] = {
        "date": None,
        "description": None,
        "debit": None,
        "credit": None,
        "amount": None,
        "merchant": None,
    }

    for idx, header in enumerate(headers):
        h = header.strip()
        if DATE_PATTERNS.search(h):
            mapping["date"] = idx
        elif DESC_PATTERNS.search(h):
            mapping["description"] = idx
        elif DEBIT_PATTERNS.search(h):
            mapping["debit"] = idx
        elif CREDIT_PATTERNS.search(h):
            mapping["credit"] = idx
        elif AMOUNT_PATTERNS.search(h):
            mapping["amount"] = idx
        elif MERCHANT_PATTERNS.search(h):
            mapping["merchant"] = idx

    return mapping


def parse_date(value: str) -> Optional[date]:
    """Try multiple date formats to parse a date string."""
    value = value.strip()
    formats = [
        "%Y-%m-%d",
        "%d-%m-%Y",
        "%d/%m/%Y",
        "%m/%d/%Y",
        "%Y/%m/%d",
        "%d-%b-%Y",
        "%d %b %Y",
        "%d-%B-%Y",
        "%d %b, %Y",
        "%d %B %Y",
        "%m-%d-%Y",
        "%Y-%m-%dT%H:%M:%S",
        "%d/%m/%y",
        "%d-%m-%y",
    ]
    for fmt in formats:
        try:
            return datetime.strptime(value, fmt).date()
        except ValueError:
            continue
    return None


def clean_amount(value: str | float | int | None) -> Optional[float]:
    """Parse an amount string, removing currency symbols and commas."""
    if value is None:
        return None
    if isinstance(value, (int, float)):
        return abs(float(value))
    s = str(value).strip()
    if not s or s == "-" or s.lower() == "nan":
        return None
    # Remove currency symbols and commas
    s = re.sub(r"[₹$€£,\s]", "", s)
    # Handle parentheses as negative
    if s.startswith("(") and s.endswith(")"):
        s = "-" + s[1:-1]
    try:
        return abs(float(s))
    except ValueError:
        return None


def clean_text(value: str | None) -> str:
    """Clean and normalize text fields."""
    if not value:
        return ""
    return re.sub(r"\s+", " ", str(value).strip())


def rows_to_transactions(
    rows: list[list[str]],
    col_map: dict[str, Optional[int]],
    filename: str,
) -> list[RawTransaction]:
    """Convert mapped rows into RawTransaction objects."""
    transactions: list[RawTransaction] = []

    for row in rows:
        if not row or all(not str(c).strip() for c in row):
            continue

        # Parse date
        date_idx = col_map.get("date")
        if date_idx is None or date_idx >= len(row):
            continue
        txn_date = parse_date(str(row[date_idx]))
        if txn_date is None:
            continue

        # Parse description
        desc_idx = col_map.get("description")
        description = clean_text(row[desc_idx]) if desc_idx is not None and desc_idx < len(row) else ""

        # Parse merchant
        merchant_idx = col_map.get("merchant")
        merchant = clean_text(row[merchant_idx]) if merchant_idx is not None and merchant_idx < len(row) else ""

        # If no separate merchant column, extract from description
        if not merchant and description:
            merchant = description.split("/")[0].split("-")[0].strip()[:255]

        # Parse amounts — determine debit/credit
        debit_idx = col_map.get("debit")
        credit_idx = col_map.get("credit")
        amount_idx = col_map.get("amount")

        amount: Optional[float] = None
        txn_type = "debit"

        if debit_idx is not None and credit_idx is not None:
            debit_val = clean_amount(row[debit_idx]) if debit_idx < len(row) else None
            credit_val = clean_amount(row[credit_idx]) if credit_idx < len(row) else None
            if debit_val and debit_val > 0:
                amount = debit_val
                txn_type = "debit"
            elif credit_val and credit_val > 0:
                amount = credit_val
                txn_type = "credit"
        elif amount_idx is not None and amount_idx < len(row):
            raw_amount = str(row[amount_idx]).strip()
            parsed = clean_amount(raw_amount)
            if parsed is not None:
                # Negative amounts are debits
                original = re.sub(r"[₹$€£,\s()]", "", raw_amount)
                try:
                    if float(original) < 0:
                        txn_type = "debit"
                    else:
                        txn_type = "credit"
                except ValueError:
                    txn_type = "debit"
                amount = parsed

        if amount is None or amount == 0:
            continue

        raw_line = " | ".join(str(c) for c in row)

        transactions.append(
            RawTransaction(
                date=txn_date,
                merchant=merchant,
                description=description,
                amount=amount,
                transaction_type=txn_type,
                raw_line=raw_line,
            )
        )

    return transactions
