from __future__ import annotations

import uuid
from datetime import date, datetime
from typing import Optional

from pydantic import BaseModel, Field


class TransactionResponse(BaseModel):
    id: uuid.UUID
    date: date
    merchant: Optional[str] = None
    description: Optional[str] = None
    amount: float
    transaction_type: str
    category: Optional[str] = None
    source_file: Optional[str] = None
    raw_line: Optional[str] = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TransactionListResponse(BaseModel):
    items: list[TransactionResponse]
    total: int
    page: int
    page_size: int
    total_pages: int


class UploadResponse(BaseModel):
    upload_id: uuid.UUID
    filename: str
    file_type: str
    status: str
    total_rows: int
    imported_rows: int
    duplicates_skipped: int
    message: str


class BulkDeleteRequest(BaseModel):
    ids: list[uuid.UUID] = Field(..., min_length=1)


class BulkCategorizeRequest(BaseModel):
    ids: list[uuid.UUID] = Field(..., min_length=1)
    category: str = Field(..., min_length=1, max_length=100)


class BulkActionResponse(BaseModel):
    affected: int
    message: str
