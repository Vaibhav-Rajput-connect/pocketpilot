from __future__ import annotations

import io

from openpyxl import load_workbook

from app.features.transactions.parsers.base import (
    BaseParser,
    RawTransaction,
    detect_columns,
    rows_to_transactions,
)


class ExcelParser(BaseParser):
    """Parses Excel (.xlsx) bank statement files."""

    def parse(self, file_bytes: bytes, filename: str) -> list[RawTransaction]:
        wb = load_workbook(filename=io.BytesIO(file_bytes), read_only=True, data_only=True)
        ws = wb.active

        if ws is None:
            return []

        all_rows: list[list[str]] = []
        for row in ws.iter_rows(values_only=True):
            all_rows.append([str(cell) if cell is not None else "" for cell in row])

        wb.close()

        if len(all_rows) < 2:
            return []

        # Find header row
        header_idx = 0
        for i, row in enumerate(all_rows):
            if len([c for c in row if c.strip()]) >= 3:
                header_idx = i
                break

        headers = all_rows[header_idx]
        col_map = detect_columns(headers)

        if col_map["date"] is None:
            return []

        data_rows = all_rows[header_idx + 1:]
        return rows_to_transactions(data_rows, col_map, filename)
