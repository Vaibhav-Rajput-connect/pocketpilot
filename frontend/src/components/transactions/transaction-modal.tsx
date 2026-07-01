"use client";

import { type Transaction } from "@/hooks/use-transactions";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Calendar,
  Store,
  FileText,
  IndianRupee,
  Tag,
  ArrowDownLeft,
  ArrowUpRight,
  Clock,
  Hash,
} from "lucide-react";

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
}

export function TransactionModal({ transaction, onClose }: Props) {
  if (!transaction) return null;

  const isCredit = transaction.transaction_type === "credit";

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="bg-[#0F172A] border border-[#1E293B] rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-[#1E293B]">
            <h2 className="text-lg font-bold text-[#F8FAFC]">
              Transaction Details
            </h2>
            <button
              onClick={onClose}
              className="text-[#94A3B8] hover:text-[#F8FAFC] transition-colors p-1 rounded-lg hover:bg-[#1E293B]"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Amount Banner */}
          <div
            className={`px-6 py-5 ${
              isCredit ? "bg-emerald-500/5" : "bg-red-500/5"
            }`}
          >
            <div className="flex items-center gap-2 mb-1">
              {isCredit ? (
                <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
              ) : (
                <ArrowUpRight className="h-4 w-4 text-red-400" />
              )}
              <span
                className={`text-xs font-bold uppercase tracking-wider ${
                  isCredit ? "text-emerald-400" : "text-red-400"
                }`}
              >
                {transaction.transaction_type}
              </span>
            </div>
            <p
              className={`text-3xl font-extrabold ${
                isCredit ? "text-emerald-400" : "text-red-400"
              }`}
            >
              {isCredit ? "+" : "-"}₹
              {transaction.amount.toLocaleString("en-IN", {
                minimumFractionDigits: 2,
              })}
            </p>
          </div>

          {/* Details */}
          <div className="px-6 py-5 space-y-4">
            <DetailRow
              icon={Calendar}
              label="Date"
              value={new Date(transaction.date).toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            />
            <DetailRow
              icon={Store}
              label="Merchant"
              value={transaction.merchant || "—"}
            />
            <DetailRow
              icon={FileText}
              label="Description"
              value={transaction.description || "—"}
            />
            <DetailRow
              icon={Tag}
              label="Category"
              value={transaction.category || "Uncategorized"}
              badge
            />
            <DetailRow
              icon={Hash}
              label="Source File"
              value={transaction.source_file || "—"}
            />
            <DetailRow
              icon={Clock}
              label="Imported At"
              value={new Date(transaction.created_at).toLocaleString("en-IN")}
            />
          </div>

          {/* Raw Line */}
          {transaction.raw_line && (
            <div className="px-6 pb-5">
              <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider mb-1.5">
                Raw Data
              </p>
              <div className="bg-[#020617] rounded-lg p-3 text-xs text-[#94A3B8] font-mono break-all max-h-24 overflow-y-auto border border-[#1E293B]">
                {transaction.raw_line}
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  badge,
}: {
  icon: any;
  label: string;
  value: string;
  badge?: boolean;
}) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="h-4 w-4 text-[#94A3B8] mt-0.5 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-[10px] text-[#94A3B8] font-semibold uppercase tracking-wider">
          {label}
        </p>
        {badge ? (
          <span className="inline-block mt-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full">
            {value}
          </span>
        ) : (
          <p className="text-sm text-[#F8FAFC] mt-0.5 break-words">{value}</p>
        )}
      </div>
    </div>
  );
}
