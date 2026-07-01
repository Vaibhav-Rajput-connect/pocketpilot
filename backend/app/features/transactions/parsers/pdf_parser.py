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
        transactions = []
        
        with pdfplumber.open(io.BytesIO(file_bytes)) as pdf:
            text_lines = []
            for page in pdf.pages:
                text = page.extract_text(layout=True)
                if text:
                    text_lines.extend(text.split('\n'))

        # State machine for multi-line transactions
        # A transaction block might start with text, then have a date line, then more text.
        # But wait! The easiest way is to find the line with the DATE.
        # The description is the text on the lines above it (since the previous date) 
        # and the text on the date line itself, and text on lines below it (until next date).
        
        # Actually, Bank of Baroda format:
        #           UPI/613388073511/01:28:10/UPI/anshsharma2                              
        #     13-05-2026                                               25.00       33.12 Cr
        #           463-3@ok     
        
        # Let's group lines by proximity to the date.
        
        parsed_txns = []
        
        current_desc_parts = []
        current_date = None
        current_amounts = [] # store raw amount strings
        
        for line in text_lines:
            line_stripped = line.strip()
            if not line_stripped:
                continue
                
            # Stop parsing if we hit summary or footer
            if "IMPORTANT MESSAGES FOR YOU" in line:
                break
                
            # Split line into columns based on large spaces
            cols = [c.strip() for c in re.split(r'\s{2,}', line) if c.strip()]
            if not cols:
                continue
                
            # Check if this line has a date as the first column
            possible_date = parse_date(cols[0])
            
            if possible_date:
                # This is a main transaction line!
                # If we already had a date, save the previous transaction
                if current_date:
                    self._commit_txn(parsed_txns, current_date, current_desc_parts, current_amounts)
                    current_desc_parts = []
                    current_amounts = []
                    
                current_date = possible_date
                
                # The rest of the columns on this date line are either description or amounts
                # Usually: Date, [Desc], Withdrawal, Deposit, Balance
                # In the BOB example: "13-05-2026", "25.00", "33.12 Cr"
                for col in cols[1:]:
                    amt, ttype = extract_amount_and_type(col)
                    if amt is not None and re.search(r'\d', col):
                        current_amounts.append(col)
                    else:
                        current_desc_parts.append(col)
            else:
                # No date found. This is a continuation of the description for the CURRENT or NEXT transaction.
                # In BOB, the description starts BEFORE the date line!
                # Wait, if current_date is None, this is description for the UPCOMING transaction.
                # So we just accumulate it in current_desc_parts.
                if len(cols) == 1:
                    current_desc_parts.append(cols[0])
                else:
                    # sometimes multiple text columns? Just join them.
                    current_desc_parts.append(" ".join(cols))
                    
        # Commit the last transaction
        if current_date:
            self._commit_txn(parsed_txns, current_date, current_desc_parts, current_amounts)
            
        # If the state machine didn't find anything, return empty list
        if not parsed_txns:
            return []
            
        return parsed_txns
        
    def _commit_txn(self, parsed_txns, date_val, desc_parts, amounts):
        if not amounts:
            return
            
        # Determine amount and type
        # In BOB: Withdrawal (Dr), Deposit (Cr), Balance
        # If there are 2 numbers: first is transaction amount, second is balance.
        # If there are 3 numbers: debit, credit, balance.
        
        # Let's just look at the first number as the transaction amount.
        amt_str = amounts[0]
        amt, txn_type = extract_amount_and_type(amt_str)
        
        if amt is None:
            return
            
        if txn_type is None:
            # Try to guess based on whether it's in the withdrawal or deposit column.
            # But we don't have column indices.
            # Usually deposits have 'Cr' in Indian banks. If no Cr/Dr, assume Debit unless it has Cr.
            # Actually, we can check the balance if we really wanted to, but let's assume Debit if no Cr/Dr, 
            # unless we have 2 amounts before balance and the first is empty... 
            # If we only have 2 amounts (Amt, Bal), and no Cr/Dr, assume Debit.
            txn_type = 'debit'
            
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

