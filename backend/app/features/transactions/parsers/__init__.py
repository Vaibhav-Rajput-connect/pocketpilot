"""Parser dispatcher — auto-detects file type and routes to the correct parser."""

from __future__ import annotations

from app.features.transactions.parsers.base import RawTransaction
from app.features.transactions.parsers.csv_parser import CSVParser
from app.features.transactions.parsers.excel_parser import ExcelParser
from app.features.transactions.parsers.pdf_parser import PDFParser


PARSERS = {
    "csv": CSVParser(),
    "xlsx": ExcelParser(),
    "pdf": PDFParser(),
}

ALLOWED_EXTENSIONS = set(PARSERS.keys())


def detect_file_type(filename: str) -> str | None:
    """Return the file extension if supported, else None."""
    ext = filename.rsplit(".", 1)[-1].lower() if "." in filename else ""
    if ext == "xls":
        ext = "xlsx"
    return ext if ext in ALLOWED_EXTENSIONS else None


def parse_file(file_bytes: bytes, filename: str) -> list[RawTransaction]:
    """Auto-detect file type and parse using the appropriate parser."""
    file_type = detect_file_type(filename)
    if file_type is None:
        raise ValueError(
            f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}"
        )
    parser = PARSERS[file_type]
    return parser.parse(file_bytes, filename)
