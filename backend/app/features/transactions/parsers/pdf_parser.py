from __future__ import annotations

import io

import pdfplumber

from app.features.transactions.parsers.base import (
    BaseParser,
    RawTransaction,
    detect_columns,
    rows_to_transactions,
)


class PDFParser(BaseParser):
    """Parses PDF bank statement files using pdfplumber table extraction."""

    def parse(self, file_bytes: bytes, filename: str) -> list[RawTransaction]:
        all_rows: list[list[str]] = []
        headers_found = False
        col_map = {}

        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    for row in table:
                        if row is None:
                            continue
                        cleaned = [str(cell).strip() if cell else "" for cell in row]

                        # Skip empty rows
                        if not any(cleaned):
                            continue

                        if not headers_found:
                            # Try this row as headers
                            test_map = detect_columns(cleaned)
                            if test_map["date"] is not None:
                                col_map = test_map
                                headers_found = True
                                continue

                        if headers_found:
                            all_rows.append(cleaned)

        if not headers_found or not all_rows:
            return []

        return rows_to_transactions(all_rows, col_map, filename)
