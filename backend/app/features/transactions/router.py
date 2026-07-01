from __future__ import annotations

import uuid
from datetime import date
from typing import Optional

from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, Query, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.dependencies import get_current_user
from app.features.users.models import User
from app.features.transactions import service as txn_service
from app.features.transactions.schemas import (
    TransactionResponse,
    TransactionListResponse,
    UploadResponse,
    BulkDeleteRequest,
    BulkCategorizeRequest,
    BulkActionResponse,
)

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.post(
    "/upload",
    response_model=UploadResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Upload a bank statement (CSV, XLSX, PDF)",
)
async def upload_statement(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> UploadResponse:
    if not file.filename:
        raise HTTPException(status_code=400, detail="No filename provided.")

    file_bytes = await file.read()
    if len(file_bytes) == 0:
        raise HTTPException(status_code=400, detail="Empty file.")
    if len(file_bytes) > 10 * 1024 * 1024:  # 10MB limit
        raise HTTPException(status_code=400, detail="File too large. Max 10MB.")

    try:
        result = await txn_service.upload_and_parse(
            db, current_user.id, file_bytes, file.filename
        )
        return UploadResponse(**result)
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get(
    "",
    response_model=TransactionListResponse,
    summary="List transactions with filters, sorting, and pagination",
)
async def list_transactions(
    search: Optional[str] = Query(None),
    category: Optional[str] = Query(None),
    transaction_type: Optional[str] = Query(None, alias="type"),
    date_from: Optional[date] = Query(None),
    date_to: Optional[date] = Query(None),
    sort_by: str = Query("date"),
    sort_order: str = Query("desc"),
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TransactionListResponse:
    result = await txn_service.list_transactions(
        db,
        current_user.id,
        search=search,
        category=category,
        transaction_type=transaction_type,
        date_from=date_from,
        date_to=date_to,
        sort_by=sort_by,
        sort_order=sort_order,
        page=page,
        page_size=page_size,
    )
    return TransactionListResponse(**result)


@router.get(
    "/categories",
    response_model=list[str],
    summary="Get distinct transaction categories",
)
async def get_categories(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[str]:
    return await txn_service.get_categories(db, current_user.id)


@router.get(
    "/{transaction_id}",
    response_model=TransactionResponse,
    summary="Get a single transaction",
)
async def get_transaction(
    transaction_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> TransactionResponse:
    txn = await txn_service.get_transaction(db, current_user.id, transaction_id)
    if txn is None:
        raise HTTPException(status_code=404, detail="Transaction not found.")
    return TransactionResponse.model_validate(txn)


@router.post(
    "/bulk-delete",
    response_model=BulkActionResponse,
    summary="Delete multiple transactions",
)
async def bulk_delete(
    data: BulkDeleteRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BulkActionResponse:
    affected = await txn_service.bulk_delete(db, current_user.id, data.ids)
    return BulkActionResponse(
        affected=affected, message=f"Deleted {affected} transactions."
    )


@router.delete("/all")
async def delete_all_transactions(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    deleted = await txn_service.delete_all(db, current_user.id)
    return {"deleted_count": deleted}


@router.post(
    "/bulk-categorize",
    response_model=BulkActionResponse,
    summary="Categorize multiple transactions",
)
async def bulk_categorize(
    data: BulkCategorizeRequest,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> BulkActionResponse:
    affected = await txn_service.bulk_categorize(
        db, current_user.id, data.ids, data.category
    )
    return BulkActionResponse(
        affected=affected,
        message=f"Categorized {affected} transactions as '{data.category}'.",
    )
