from __future__ import annotations

import math
import uuid
from datetime import date
from typing import Optional

from sqlalchemy import select, func, delete, update, distinct
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.features.transactions.models import Transaction, UploadSession
from app.features.transactions.parsers import parse_file, detect_file_type


async def upload_and_parse(
    db: AsyncSession,
    user_id: uuid.UUID,
    file_bytes: bytes,
    filename: str,
) -> dict:
    """Parse an uploaded file, deduplicate, and store transactions."""
    file_type = detect_file_type(filename)
    if file_type is None:
        raise ValueError("Unsupported file type. Allowed: csv, xlsx, pdf")

    # Create upload session
    session = UploadSession(
        user_id=user_id,
        filename=filename,
        file_type=file_type,
        status="processing",
    )
    db.add(session)
    await db.flush()

    try:
        raw_transactions = parse_file(file_bytes, filename)
        session.total_rows = len(raw_transactions)

        imported = 0
        duplicates = 0

        for raw in raw_transactions:
            txn = Transaction(
                user_id=user_id,
                date=raw.date,
                merchant=raw.merchant,
                description=raw.description,
                amount=raw.amount,
                transaction_type=raw.transaction_type,
                category="Uncategorized",
                source_file=filename,
                raw_line=raw.raw_line,
                hash=raw.hash,
            )
            db.add(txn)
            try:
                await db.flush()
                imported += 1
            except IntegrityError:
                await db.rollback()
                # Re-add the session since rollback cleared it
                db.add(session)
                await db.flush()
                duplicates += 1

        session.imported_rows = imported
        session.duplicates_skipped = duplicates
        session.status = "completed"

    except Exception as e:
        session.status = "failed"
        session.error_message = str(e)[:500]
        raise

    return {
        "upload_id": session.id,
        "filename": filename,
        "file_type": file_type,
        "status": session.status,
        "total_rows": session.total_rows,
        "imported_rows": session.imported_rows,
        "duplicates_skipped": session.duplicates_skipped,
        "message": f"Successfully imported {session.imported_rows} transactions. {session.duplicates_skipped} duplicates skipped.",
    }


async def list_transactions(
    db: AsyncSession,
    user_id: uuid.UUID,
    *,
    search: Optional[str] = None,
    category: Optional[str] = None,
    transaction_type: Optional[str] = None,
    date_from: Optional[date] = None,
    date_to: Optional[date] = None,
    sort_by: str = "date",
    sort_order: str = "desc",
    page: int = 1,
    page_size: int = 20,
) -> dict:
    """List transactions with filters, sorting, and pagination."""
    base = select(Transaction).where(Transaction.user_id == user_id)

    if search:
        pattern = f"%{search}%"
        base = base.where(
            (Transaction.merchant.ilike(pattern))
            | (Transaction.description.ilike(pattern))
        )
    if category:
        base = base.where(Transaction.category == category)
    if transaction_type:
        base = base.where(Transaction.transaction_type == transaction_type)
    if date_from:
        base = base.where(Transaction.date >= date_from)
    if date_to:
        base = base.where(Transaction.date <= date_to)

    # Count total
    count_q = select(func.count()).select_from(base.subquery())
    total = (await db.execute(count_q)).scalar() or 0

    # Sort
    sort_col = getattr(Transaction, sort_by, Transaction.date)
    if sort_order == "asc":
        base = base.order_by(sort_col.asc())
    else:
        base = base.order_by(sort_col.desc())

    # Paginate
    offset = (page - 1) * page_size
    base = base.offset(offset).limit(page_size)

    result = await db.execute(base)
    items = list(result.scalars().all())

    return {
        "items": items,
        "total": total,
        "page": page,
        "page_size": page_size,
        "total_pages": math.ceil(total / page_size) if page_size > 0 else 0,
    }


async def get_transaction(
    db: AsyncSession, user_id: uuid.UUID, txn_id: uuid.UUID
) -> Transaction | None:
    """Get a single transaction by ID."""
    result = await db.execute(
        select(Transaction).where(
            Transaction.id == txn_id, Transaction.user_id == user_id
        )
    )
    return result.scalar_one_or_none()


async def bulk_delete(
    db: AsyncSession, user_id: uuid.UUID, ids: list[uuid.UUID]
) -> int:
    """Delete multiple transactions by IDs."""
    result = await db.execute(
        delete(Transaction).where(
            Transaction.user_id == user_id, Transaction.id.in_(ids)
        )
    )
    return result.rowcount  # type: ignore[return-value]


async def bulk_categorize(
    db: AsyncSession,
    user_id: uuid.UUID,
    ids: list[uuid.UUID],
    category: str,
) -> int:
    """Update category for multiple transactions."""
    result = await db.execute(
        update(Transaction)
        .where(Transaction.user_id == user_id, Transaction.id.in_(ids))
        .values(category=category)
    )
    return result.rowcount  # type: ignore[return-value]


async def get_categories(db: AsyncSession, user_id: uuid.UUID) -> list[str]:
    """Get distinct category values for a user."""
    result = await db.execute(
        select(distinct(Transaction.category))
        .where(Transaction.user_id == user_id)
        .where(Transaction.category.isnot(None))
        .order_by(Transaction.category)
    )
    return [row[0] for row in result.all()]
