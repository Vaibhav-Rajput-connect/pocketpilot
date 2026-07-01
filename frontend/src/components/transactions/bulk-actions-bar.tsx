"use client";

import { useState } from "react";
import { useBulkDelete, useBulkCategorize } from "@/hooks/use-transactions";
import { Trash2, Tag, X, Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Props {
  selectedIds: string[];
  onClear: () => void;
}

const QUICK_CATEGORIES = [
  "Food & Dining",
  "Shopping",
  "Transportation",
  "Bills & Utilities",
  "Entertainment",
  "Health",
  "Education",
  "Salary",
  "Investment",
  "Transfer",
  "Other",
];

export function BulkActionsBar({ selectedIds, onClear }: Props) {
  const [showCategories, setShowCategories] = useState(false);
  const bulkDelete = useBulkDelete();
  const bulkCategorize = useBulkCategorize();

  if (selectedIds.length === 0) return null;

  const handleDelete = async () => {
    if (!confirm(`Delete ${selectedIds.length} transaction(s)?`)) return;
    await bulkDelete.mutateAsync(selectedIds);
    onClear();
  };

  const handleCategorize = async (category: string) => {
    await bulkCategorize.mutateAsync({ ids: selectedIds, category });
    setShowCategories(false);
    onClear();
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40"
      >
        <div className="flex items-center gap-3 bg-[#0F172A] border border-[#1E293B] rounded-2xl px-5 py-3 shadow-2xl shadow-black/50">
          <span className="text-sm font-semibold text-[#F8FAFC]">
            {selectedIds.length} selected
          </span>

          <div className="w-px h-5 bg-[#1E293B]" />

          {/* Categorize */}
          <div className="relative">
            <button
              onClick={() => setShowCategories(!showCategories)}
              disabled={bulkCategorize.isPending}
              className="flex items-center gap-1.5 text-xs font-semibold text-emerald-400 hover:text-emerald-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-emerald-500/10"
            >
              {bulkCategorize.isPending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Tag className="h-3.5 w-3.5" />
              )}
              Categorize
            </button>

            <AnimatePresence>
              {showCategories && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: 5 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 5 }}
                  className="absolute bottom-full left-0 mb-2 bg-[#0F172A] border border-[#1E293B] rounded-xl shadow-2xl p-2 min-w-[180px] max-h-[250px] overflow-y-auto"
                >
                  {QUICK_CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => handleCategorize(cat)}
                      className="w-full text-left text-xs font-medium text-[#F8FAFC] hover:bg-emerald-500/10 hover:text-emerald-400 px-3 py-2 rounded-lg transition-colors"
                    >
                      {cat}
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Delete */}
          <button
            onClick={handleDelete}
            disabled={bulkDelete.isPending}
            className="flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 transition-colors px-3 py-1.5 rounded-lg hover:bg-red-500/10"
          >
            {bulkDelete.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            Delete
          </button>

          <div className="w-px h-5 bg-[#1E293B]" />

          {/* Clear */}
          <button
            onClick={onClear}
            className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </motion.div>
    </AnimatePresence>
  );
}
