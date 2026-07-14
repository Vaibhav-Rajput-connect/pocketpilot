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

        # Find header row by looking for date and amount columns
        header_idx = -1
        col_map = None
        for i, row in enumerate(all_rows):
            temp_map = detect_columns(row)
            if temp_map["date"] is not None and (temp_map["amount"] is not None or temp_map["debit"] is not None):
                header_idx = i
                col_map = temp_map
                break

        if header_idx == -1 or col_map is None:
            return []

        data_rows = all_rows[header_idx + 1:]
        return rows_to_transactions(data_rows, col_map, filename)
