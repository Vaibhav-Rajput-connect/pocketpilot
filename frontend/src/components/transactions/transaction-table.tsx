"use client";

import { type Transaction } from "@/hooks/use-transactions";
import {
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ArrowDownLeft,
  ArrowUpRight,
} from "lucide-react";

interface Props {
  transactions: Transaction[];
  selectedIds: string[];
  onToggleSelect: (id: string) => void;
  onToggleAll: () => void;
  onRowClick: (txn: Transaction) => void;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSort: (column: string) => void;
}

function SortIcon({
  column,
  sortBy,
  sortOrder,
}: {
  column: string;
  sortBy: string;
  sortOrder: string;
}) {
  if (column !== sortBy)
    return <ArrowUpDown className="h-3 w-3 text-[#94A3B8]/50" />;
  return sortOrder === "asc" ? (
    <ArrowUp className="h-3 w-3 text-emerald-400" />
  ) : (
    <ArrowDown className="h-3 w-3 text-emerald-400" />
  );
}

export function TransactionTable({
  transactions,
  selectedIds,
  onToggleSelect,
  onToggleAll,
  onRowClick,
  sortBy,
  sortOrder,
  onSort,
}: Props) {
  const allSelected =
    transactions.length > 0 &&
    transactions.every((t) => selectedIds.includes(t.id));

  return (
    <div className="overflow-x-auto rounded-xl border border-[#1E293B]">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-[#0F172A] border-b border-[#1E293B]">
            <th className="w-10 px-3 py-3">
              <input
                type="checkbox"
                checked={allSelected}
                onChange={onToggleAll}
                className="rounded border-[#1E293B] bg-[#020617] text-emerald-500 focus:ring-emerald-500/20 h-4 w-4"
              />
            </th>
            <th
              className="px-4 py-3 text-left font-semibold text-[#94A3B8] text-xs uppercase tracking-wider cursor-pointer hover:text-[#F8FAFC] transition-colors select-none"
              onClick={() => onSort("date")}
            >
              <div className="flex items-center gap-1.5">
                Date
                <SortIcon column="date" sortBy={sortBy} sortOrder={sortOrder} />
              </div>
            </th>
            <th className="px-4 py-3 text-left font-semibold text-[#94A3B8] text-xs uppercase tracking-wider">
              Merchant
            </th>
            <th className="px-4 py-3 text-left font-semibold text-[#94A3B8] text-xs uppercase tracking-wider hidden lg:table-cell">
              Description
            </th>
            <th className="px-4 py-3 text-left font-semibold text-[#94A3B8] text-xs uppercase tracking-wider">
              Category
            </th>
            <th
              className="px-4 py-3 text-right font-semibold text-[#94A3B8] text-xs uppercase tracking-wider cursor-pointer hover:text-[#F8FAFC] transition-colors select-none"
              onClick={() => onSort("amount")}
            >
              <div className="flex items-center justify-end gap-1.5">
                Amount
                <SortIcon
                  column="amount"
                  sortBy={sortBy}
                  sortOrder={sortOrder}
                />
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((txn) => {
            const isSelected = selectedIds.includes(txn.id);
            const isCredit = txn.transaction_type === "credit";

            return (
              <tr
                key={txn.id}
                onClick={() => onRowClick(txn)}
                className={`
                  border-b border-[#1E293B]/50 cursor-pointer transition-colors
                  ${
                    isSelected
                      ? "bg-emerald-500/5"
                      : "hover:bg-[#0F172A]/60"
                  }
                `}
              >
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelect(txn.id)}
                    className="rounded border-[#1E293B] bg-[#020617] text-emerald-500 focus:ring-emerald-500/20 h-4 w-4"
                  />
                </td>
                <td className="px-4 py-3 text-[#F8FAFC] font-medium whitespace-nowrap">
                  {new Date(txn.date).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div
                      className={`h-7 w-7 rounded-lg flex items-center justify-center shrink-0 ${
                        isCredit
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-red-500/10 text-red-400"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="h-3.5 w-3.5" />
                      ) : (
                        <ArrowUpRight className="h-3.5 w-3.5" />
                      )}
                    </div>
                    <span className="text-[#F8FAFC] font-medium truncate max-w-[160px]">
                      {txn.merchant || "Unknown"}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-[#94A3B8] truncate max-w-[200px] hidden lg:table-cell">
                  {txn.description || "—"}
                </td>
                <td className="px-4 py-3">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wider bg-[#1E293B] text-[#94A3B8] px-2 py-1 rounded-md">
                    {txn.category || "Uncategorized"}
                  </span>
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <span
                    className={`font-bold ${
                      isCredit ? "text-emerald-400" : "text-red-400"
                    }`}
                  >
                    {isCredit ? "+" : "-"}₹
                    {txn.amount.toLocaleString("en-IN", {
                      minimumFractionDigits: 2,
                    })}
                  </span>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {transactions.length === 0 && (
        <div className="text-center py-16">
          <p className="text-[#94A3B8] text-sm font-medium">
            No transactions found
          </p>
          <p className="text-[#94A3B8]/60 text-xs mt-1">
            Upload a bank statement to get started
          </p>
        </div>
      )}
    </div>
  );
}
