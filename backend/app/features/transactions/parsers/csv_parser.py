from __future__ import annotations

import csv
import io

from app.features.transactions.parsers.base import (
    BaseParser,
    RawTransaction,
    detect_columns,
    rows_to_transactions,
)


class CSVParser(BaseParser):
    """Parses CSV bank statement files."""

    def parse(self, file_bytes: bytes, filename: str) -> list[RawTransaction]:
        # Try UTF-8 first, fall back to latin-1
        for encoding in ("utf-8", "utf-8-sig", "latin-1", "cp1252"):
            try:
                text = file_bytes.decode(encoding)
                break
            except UnicodeDecodeError:
                continue
        else:
            text = file_bytes.decode("utf-8", errors="replace")

        reader = csv.reader(io.StringIO(text))
        all_rows = list(reader)

        if len(all_rows) < 2:
            return []

        # First non-empty row with enough columns is likely the header
        header_idx = 0
        for i, row in enumerate(all_rows):
            if len([c for c in row if c.strip()]) >= 3:
                header_idx = i
                break

        headers = all_rows[header_idx]
        col_map = detect_columns(headers)

        # If we couldn't detect a date column, this isn't a valid statement
        if col_map["date"] is None:
            return []

        data_rows = all_rows[header_idx + 1:]
        return rows_to_transactions(data_rows, col_map, filename)
