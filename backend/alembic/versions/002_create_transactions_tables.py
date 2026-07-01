"""create transactions and upload_sessions tables

Revision ID: 002
Revises: 001
Create Date: 2024-01-02 00:00:00.000000
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects.postgresql import UUID


revision: str = "002"
down_revision: Union[str, None] = "001"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.create_table(
        "upload_sessions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("filename", sa.String(255), nullable=False),
        sa.Column("file_type", sa.String(10), nullable=False),
        sa.Column(
            "status", sa.String(20), nullable=False, server_default="processing"
        ),
        sa.Column("total_rows", sa.Integer, nullable=False, server_default="0"),
        sa.Column("imported_rows", sa.Integer, nullable=False, server_default="0"),
        sa.Column(
            "duplicates_skipped", sa.Integer, nullable=False, server_default="0"
        ),
        sa.Column("error_message", sa.Text, nullable=True),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
    )

    op.create_table(
        "transactions",
        sa.Column("id", UUID(as_uuid=True), primary_key=True),
        sa.Column(
            "user_id",
            UUID(as_uuid=True),
            sa.ForeignKey("users.id", ondelete="CASCADE"),
            nullable=False,
            index=True,
        ),
        sa.Column("date", sa.Date, nullable=False),
        sa.Column("merchant", sa.String(255), nullable=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("amount", sa.Numeric(14, 2), nullable=False),
        sa.Column(
            "transaction_type",
            sa.String(10),
            nullable=False,
            server_default="debit",
        ),
        sa.Column(
            "category",
            sa.String(100),
            nullable=True,
            server_default="Uncategorized",
        ),
        sa.Column("source_file", sa.String(255), nullable=True),
        sa.Column("raw_line", sa.Text, nullable=True),
        sa.Column("hash", sa.String(64), nullable=False),
        sa.Column(
            "created_at",
            sa.DateTime(timezone=True),
            nullable=False,
            server_default=sa.func.now(),
        ),
        sa.UniqueConstraint("user_id", "hash", name="uq_user_transaction_hash"),
    )

    op.create_index(
        "ix_transactions_user_date", "transactions", ["user_id", "date"]
    )
    op.create_index(
        "ix_transactions_user_category", "transactions", ["user_id", "category"]
    )


def downgrade() -> None:
    op.drop_index("ix_transactions_user_category", table_name="transactions")
    op.drop_index("ix_transactions_user_date", table_name="transactions")
    op.drop_table("transactions")
    op.drop_table("upload_sessions")
