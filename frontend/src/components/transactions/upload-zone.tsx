"use client";

import { useCallback, useState } from "react";
import { useUploadStatement, type UploadResponse } from "@/hooks/use-transactions";
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function UploadZone() {
  const [isDragging, setIsDragging] = useState(false);
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const upload = useUploadStatement();

  const handleFile = useCallback(
    async (file: File) => {
      setResult(null);
      setError(null);

      const ext = file.name.split(".").pop()?.toLowerCase();
      if (!ext || !["csv", "xlsx", "xls", "pdf"].includes(ext)) {
        setError("Unsupported file type. Please upload CSV, Excel, or PDF.");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("File too large. Maximum 10MB.");
        return;
      }

      try {
        const res = await upload.mutateAsync(file);
        setResult(res);
      } catch (err: any) {
        setError(
          err?.response?.data?.detail || err?.message || "Upload failed."
        );
      }
    },
    [upload]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => setIsDragging(false);

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = "";
  };

  return (
    <div className="space-y-3">
      <div
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        className={`
          relative border-2 border-dashed rounded-2xl p-8 text-center
          transition-all duration-300 cursor-pointer group
          ${
            isDragging
              ? "border-emerald-500 bg-emerald-500/5 scale-[1.01]"
              : "border-[#1E293B] hover:border-emerald-500/40 hover:bg-[#0F172A]/50"
          }
        `}
        onClick={() => document.getElementById("file-upload")?.click()}
      >
        <input
          id="file-upload"
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={onFileSelect}
          className="hidden"
        />

        {upload.isPending ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-emerald-500 animate-spin" />
            <p className="text-sm text-[#94A3B8] font-medium">
              Processing your statement...
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Upload className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-[#F8FAFC]">
                Drop your bank statement here or{" "}
                <span className="text-emerald-400 underline underline-offset-2">
                  browse
                </span>
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">
                Supports CSV and Excel (.xlsx) — Max 10MB
              </p>
            </div>
          </div>
        )}
      </div>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 p-4"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-emerald-400">
                Upload Successful
              </p>
              <p className="text-xs text-[#94A3B8] mt-1">
                <FileText className="inline h-3 w-3 mr-1" />
                {result.filename} — {result.imported_rows} imported,{" "}
                {result.duplicates_skipped} duplicates skipped
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setResult(null);
              }}
              className="text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="flex items-start gap-3 rounded-xl bg-red-500/10 border border-red-500/20 p-4"
          >
            <AlertCircle className="h-5 w-5 text-red-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-semibold text-red-400">Upload Failed</p>
              <p className="text-xs text-[#94A3B8] mt-1">{error}</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setError(null);
              }}
              className="text-[#94A3B8] hover:text-[#F8FAFC]"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
