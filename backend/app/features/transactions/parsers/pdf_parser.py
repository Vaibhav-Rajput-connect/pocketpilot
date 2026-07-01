from __future__ import annotations

import io
import re
import logging

import pdfplumber

from app.features.transactions.parsers.base import (
    BaseParser,
    RawTransaction,
    parse_date,
    clean_amount,
    detect_columns,
    rows_to_transactions,
)

logger = logging.getLogger(__name__)

def extract_amount_and_type(val_str: str) -> tuple[float | None, str | None]:
    val_str = val_str.strip()
    txn_type = None
    if val_str.lower().endswith('cr'):
        txn_type = 'credit'
    elif val_str.lower().endswith('dr'):
        txn_type = 'debit'
    
    clean_str = re.sub(r'(?i)cr|dr', '', val_str)
    amt = clean_amount(clean_str)
    return amt, txn_type

class PDFParser(BaseParser):
    def parse(self, file_bytes: bytes, filename: str) -> list[RawTransaction]:
        """Universal PDF parser trying multiple strategies in order of reliability."""
        parsed_txns = []

        # Strategy 1: Universal Table Scanner
        parsed_txns = self._parse_tables(file_bytes, filename)
        if parsed_txns:
            return parsed_txns

        # Strategy 2: Multi-line custom grouping (e.g. Bank of Baroda format)
        parsed_txns = self._parse_multiline_custom(file_bytes)
        if parsed_txns:
            return parsed_txns

        # Strategy 3: Universal Regex Text Scanner (e.g. GPay)
        return self._fallback_parse(file_bytes)

    def _parse_tables(self, file_bytes: bytes, filename: str) -> list[RawTransaction]:
        """Dynamically detect headers in PDF tables and map columns."""
        parsed_txns = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                tables = page.extract_tables()
                for table in tables:
                    if not table or len(table) < 2:
                        continue
                        
                    # Clean the table data (None to empty string)
                    clean_table = []
                    for row in table:
                        clean_table.append([str(c).strip() if c is not None else "" for c in row])

                    # Find the header row
                    header_idx = -1
                    best_map = None
                    for i, row in enumerate(clean_table):
                        # A row is a likely header if detect_columns finds at least a date and an amount/debit column
                        col_map = detect_columns(row)
                        if col_map["date"] is not None and (col_map["amount"] is not None or col_map["debit"] is not None):
                            header_idx = i
                            best_map = col_map
                            break

                    if header_idx != -1 and best_map is not None:
                        data_rows = clean_table[header_idx + 1:]
                        # Filter out empty rows or footer rows before parsing
                        valid_data = [r for r in data_rows if any(c.strip() for c in r)]
                        txns = rows_to_transactions(valid_data, best_map, filename)
                        parsed_txns.extend(txns)

        return parsed_txns

    def _parse_multiline_custom(self, file_bytes: bytes) -> list[RawTransaction]:
        """Specific fallback for banks that print multi-line transactions with dates at the bottom."""
        parsed_txns = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text_lines = []
            for page in pdf.pages:
                text = page.extract_text(layout=True)
                if text:
                    text_lines.extend(text.split('\n'))

        current_desc_parts = []
        current_date = None
        current_amounts = []
        
        for line in text_lines:
            line_stripped = line.strip()
            if not line_stripped:
                continue
                
            if "IMPORTANT MESSAGES FOR YOU" in line:
                break
                
            # Use wide spacing to only target specific multi-line formats like Bank of Baroda
            cols = [c.strip() for c in re.split(r'\s{2,}', line) if c.strip()]
            if not cols:
                continue
                
            possible_date = parse_date(cols[0])
            
            if possible_date:
                if current_date:
                    self._commit_txn(parsed_txns, current_date, current_desc_parts, current_amounts)
                    current_desc_parts = []
                    current_amounts = []
                    
                current_date = possible_date
                
                for col in cols[1:]:
                    amt, ttype = extract_amount_and_type(col)
                    if amt is not None and re.search(r'\d', col):
                        current_amounts.append(col)
                    else:
                        current_desc_parts.append(col)
            else:
                if len(cols) == 1:
                    current_desc_parts.append(cols[0])
                else:
                    current_desc_parts.append(" ".join(cols))
                    
        if current_date:
            self._commit_txn(parsed_txns, current_date, current_desc_parts, current_amounts)
            
        return parsed_txns

    def _commit_txn(self, parsed_txns, date_val, desc_parts, amounts):
        if not amounts:
            return
            
        amt_str = amounts[0]
        amt, txn_type = extract_amount_and_type(amt_str)
        
        if amt is None:
            return
            
        balance_str = amounts[-1]
        current_balance, _ = extract_amount_and_type(balance_str)
            
        if txn_type is None:
            if hasattr(self, 'last_balance') and self.last_balance is not None and current_balance is not None:
                if current_balance > self.last_balance:
                    txn_type = 'credit'
                else:
                    txn_type = 'debit'
            else:
                txn_type = 'debit'
                
        if current_balance is not None:
            self.last_balance = current_balance
            
        desc = " ".join(desc_parts)
        merchant = desc.split("/")[0].split("-")[0].strip()[:255] if desc else "Unknown"
        
        parsed_txns.append(
            RawTransaction(
                date=date_val,
                merchant=merchant,
                description=desc,
                amount=amt,
                transaction_type=txn_type,
                raw_line=desc + " " + " ".join(amounts)
            )
        )

    def _fallback_parse(self, file_bytes: bytes) -> list[RawTransaction]:
        """A highly resilient fallback parser for generic statements like GPay."""
        parsed_txns = []
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            for page in pdf.pages:
                text = page.extract_text(x_tolerance=2, y_tolerance=2)
                if not text: continue
                for line in text.split('\n'):
                    line = line.strip()
                    cols = line.split()
                    if len(cols) < 3: continue
                    
                    # Check if first 3 tokens form a date (e.g. '01 Jan, 2026')
                    date_str_3 = " ".join(cols[:3])
                    date_str_1 = cols[0]
                    
                    d = parse_date(date_str_3)
                    used_cols = 3
                    if not d:
                        d = parse_date(date_str_1)
                        used_cols = 1
                        
                    if d:
                        amt = None
                        txn_type = None
                        
                        # GPay specific: "Paid to" vs "Received from"
                        line_lower = line.lower()
                        if "paid to" in line_lower:
                            txn_type = "debit"
                        elif "received from" in line_lower:
                            txn_type = "credit"
                            
                        # Forward search for all amounts on the line
                        all_amounts = []
                        for col in cols[used_cols:]:
                            if "." not in col: continue
                            a, t = extract_amount_and_type(col)
                            if a is not None:
                                all_amounts.append((a, t, col))
                        
                        if all_amounts:
                            # First amount is the transaction amount
                            amt = all_amounts[0][0]
                            txn_type = all_amounts[0][1]
                            
                            current_balance = None
                            if len(all_amounts) > 1:
                                # Last amount is the balance
                                current_balance = all_amounts[-1][0]
                                
                            if txn_type is None:
                                # Try to determine from balance difference!
                                if current_balance is not None and hasattr(self, 'last_balance') and self.last_balance is not None:
                                    if current_balance > self.last_balance:
                                        txn_type = "credit"
                                    else:
                                        txn_type = "debit"
                                else:
                                    # Fallback to text analysis
                                    line_lower = line.lower()
                                    if re.search(r'(?i)\b(cr|credit|neftcr|inward)\b|cr-', line_lower) or "deposit" in line_lower:
                                        txn_type = "credit"
                                    elif re.search(r'(?i)\b(dr|debit|withdrawal|neftdr|outward)\b|dr-', line_lower) or "withdraw" in line_lower:
                                        txn_type = "debit"
                                    else:
                                        txn_type = "debit"
                                        
                            if current_balance is not None:
                                self.last_balance = current_balance

                            desc = " ".join(cols[used_cols:-1])
                            merchant = desc.split("/")[0][:255] if desc else "Unknown"
                            parsed_txns.append(
                                RawTransaction(
                                    date=d,
                                    merchant=merchant,
                                    description=desc,
                                    amount=amt,
                                    transaction_type=txn_type,
                                    raw_line=line
                                )
                            )
                            
        return parsed_txns

