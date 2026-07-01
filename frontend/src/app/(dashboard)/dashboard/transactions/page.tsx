"use client";

import { useState, useCallback } from "react";
import {
  useTransactions,
  useCategories,
  type Transaction,
  type TransactionFilters,
} from "@/hooks/use-transactions";
import { UploadZone } from "@/components/transactions/upload-zone";
import { TransactionTable } from "@/components/transactions/transaction-table";
import { TransactionModal } from "@/components/transactions/transaction-modal";
import { BulkActionsBar } from "@/components/transactions/bulk-actions-bar";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Wallet,
} from "lucide-react";

export default function TransactionsPage() {
  // ── Filters State ──
  const [filters, setFilters] = useState<TransactionFilters>({
    page: 1,
    page_size: 20,
    sort_by: "date",
    sort_order: "desc",
  });
  const [searchInput, setSearchInput] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);

  const { data, isLoading } = useTransactions(filters);
  const { data: categories } = useCategories();

  // ── Handlers ──
  const updateFilter = (update: Partial<TransactionFilters>) => {
    setFilters((prev) => ({ ...prev, ...update, page: update.page ?? 1 }));
    setSelectedIds([]);
  };

  const handleSearch = () => {
    updateFilter({ search: searchInput || undefined });
  };

  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSearch();
  };

  const handleSort = (column: string) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: column,
      sort_order:
        prev.sort_by === column && prev.sort_order === "desc" ? "asc" : "desc",
    }));
  };

  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  }, []);

  const toggleAll = useCallback(() => {
    if (!data) return;
    const allIds = data.items.map((t) => t.id);
    const allSelected = allIds.every((id) => selectedIds.includes(id));
    setSelectedIds(allSelected ? [] : allIds);
  }, [data, selectedIds]);

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center">
          <Wallet className="h-5 w-5 text-emerald-400" />
        </div>
        <div>
          <h1 className="text-2xl font-extrabold text-[#F8FAFC]">
            Transactions
          </h1>
          <p className="text-xs text-[#94A3B8]">
            Upload statements and manage your transactions
          </p>
        </div>
      </div>

      {/* Upload Zone */}
      <UploadZone />

      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[#94A3B8]" />
          <input
            type="text"
            placeholder="Search merchant or description..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-[#0F172A] border border-[#1E293B] text-sm text-[#F8FAFC] placeholder:text-[#94A3B8]/50 focus:outline-none focus:border-emerald-500/40 transition-colors"
          />
        </div>

        {/* Category Filter */}
        <select
          value={filters.category || ""}
          onChange={(e) =>
            updateFilter({ category: e.target.value || undefined })
          }
          className="px-3 py-2.5 rounded-xl bg-[#0F172A] border border-[#1E293B] text-sm text-[#F8FAFC] focus:outline-none focus:border-emerald-500/40 transition-colors min-w-[140px]"
        >
          <option value="">All Categories</option>
          {categories?.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>

        {/* Type Filter */}
        <select
          value={filters.type || ""}
          onChange={(e) => updateFilter({ type: e.target.value || undefined })}
          className="px-3 py-2.5 rounded-xl bg-[#0F172A] border border-[#1E293B] text-sm text-[#F8FAFC] focus:outline-none focus:border-emerald-500/40 transition-colors min-w-[120px]"
        >
          <option value="">All Types</option>
          <option value="debit">Debit</option>
          <option value="credit">Credit</option>
        </select>

        {/* Date Filters */}
        <input
          type="date"
          value={filters.date_from || ""}
          onChange={(e) =>
            updateFilter({ date_from: e.target.value || undefined })
          }
          className="px-3 py-2.5 rounded-xl bg-[#0F172A] border border-[#1E293B] text-sm text-[#F8FAFC] focus:outline-none focus:border-emerald-500/40 transition-colors"
          placeholder="From"
        />
        <input
          type="date"
          value={filters.date_to || ""}
          onChange={(e) =>
            updateFilter({ date_to: e.target.value || undefined })
          }
          className="px-3 py-2.5 rounded-xl bg-[#0F172A] border border-[#1E293B] text-sm text-[#F8FAFC] focus:outline-none focus:border-emerald-500/40 transition-colors"
        />

        <button
          onClick={handleSearch}
          className="px-4 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-[#020617] text-sm font-bold transition-colors shrink-0"
        >
          <Filter className="h-4 w-4" />
        </button>
      </div>

      {/* Results count */}
      {data && (
        <p className="text-xs text-[#94A3B8]">
          Showing{" "}
          <span className="text-[#F8FAFC] font-semibold">
            {data.items.length}
          </span>{" "}
          of{" "}
          <span className="text-[#F8FAFC] font-semibold">{data.total}</span>{" "}
          transactions
        </p>
      )}

      {/* Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      ) : (
        <TransactionTable
          transactions={data?.items || []}
          selectedIds={selectedIds}
          onToggleSelect={toggleSelect}
          onToggleAll={toggleAll}
          onRowClick={setSelectedTxn}
          sortBy={filters.sort_by || "date"}
          sortOrder={filters.sort_order || "desc"}
          onSort={handleSort}
        />
      )}

      {/* Pagination */}
      {data && data.total_pages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => updateFilter({ page: (filters.page || 1) - 1 })}
            disabled={(filters.page || 1) <= 1}
            className="p-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-emerald-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          {Array.from({ length: Math.min(data.total_pages, 7) }, (_, i) => {
            const page = i + 1;
            const isActive = page === (filters.page || 1);
            return (
              <button
                key={page}
                onClick={() => updateFilter({ page })}
                className={`h-9 w-9 rounded-lg text-xs font-bold transition-colors ${
                  isActive
                    ? "bg-emerald-500 text-[#020617]"
                    : "bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-emerald-500/40"
                }`}
              >
                {page}
              </button>
            );
          })}

          <button
            onClick={() => updateFilter({ page: (filters.page || 1) + 1 })}
            disabled={(filters.page || 1) >= data.total_pages}
            className="p-2 rounded-lg bg-[#0F172A] border border-[#1E293B] text-[#94A3B8] hover:text-[#F8FAFC] hover:border-emerald-500/40 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Bulk Actions */}
      <BulkActionsBar
        selectedIds={selectedIds}
        onClear={() => setSelectedIds([])}
      />

      {/* Detail Modal */}
      <TransactionModal
        transaction={selectedTxn}
        onClose={() => setSelectedTxn(null)}
      />
    </motion.div>
  );
}
