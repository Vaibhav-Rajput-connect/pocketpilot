import { apiClient, getErrorMessage } from "@/lib/api-client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ── Types ──

export interface Transaction {
  id: string;
  date: string;
  merchant: string | null;
  description: string | null;
  amount: number;
  transaction_type: "debit" | "credit";
  category: string | null;
  source_file: string | null;
  raw_line: string | null;
  created_at: string;
}

export interface TransactionListResponse {
  items: Transaction[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface UploadResponse {
  upload_id: string;
  filename: string;
  file_type: string;
  status: string;
  total_rows: number;
  imported_rows: number;
  duplicates_skipped: number;
  message: string;
}

export interface BulkActionResponse {
  affected: number;
  message: string;
}

export interface TransactionFilters {
  search?: string;
  category?: string;
  type?: string;
  date_from?: string;
  date_to?: string;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  page?: number;
  page_size?: number;
}

// ── Hooks ──

export function useTransactions(filters: TransactionFilters) {
  return useQuery<TransactionListResponse>({
    queryKey: ["transactions", filters],
    queryFn: async () => {
      const params: Record<string, string> = {};
      if (filters.search) params.search = filters.search;
      if (filters.category) params.category = filters.category;
      if (filters.type) params.type = filters.type;
      if (filters.date_from) params.date_from = filters.date_from;
      if (filters.date_to) params.date_to = filters.date_to;
      if (filters.sort_by) params.sort_by = filters.sort_by;
      if (filters.sort_order) params.sort_order = filters.sort_order;
      if (filters.page) params.page = String(filters.page);
      if (filters.page_size) params.page_size = String(filters.page_size);

      const { data } = await apiClient.get("/transactions", { params });
      return data;
    },
  });
}

export function useUploadStatement() {
  const queryClient = useQueryClient();

  return useMutation<UploadResponse, Error, File>({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await apiClient.post("/transactions/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
        timeout: 60_000,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useBulkDelete() {
  const queryClient = useQueryClient();

  return useMutation<BulkActionResponse, Error, string[]>({
    mutationFn: async (ids: string[]) => {
      const { data } = await apiClient.post("/transactions/bulk-delete", {
        ids,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
    },
  });
}

export function useBulkCategorize() {
  const queryClient = useQueryClient();

  return useMutation<
    BulkActionResponse,
    Error,
    { ids: string[]; category: string }
  >({
    mutationFn: async ({ ids, category }) => {
      const { data } = await apiClient.post("/transactions/bulk-categorize", {
        ids,
        category,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
}

export function useCategories() {
  return useQuery<string[]>({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await apiClient.get("/transactions/categories");
      return data;
    },
  });
}
