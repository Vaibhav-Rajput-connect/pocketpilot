import { apiClient } from "@/lib/api-client";
import { useQuery } from "@tanstack/react-query";

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
}

export interface TopMerchant {
  merchant: string;
  total: number;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  income: number;
  expense: number;
}

export interface RecentTransaction {
  id: string;
  date: string;
  merchant: string | null;
  description: string | null;
  amount: number;
  transaction_type: "debit" | "credit";
  category: string | null;
}

export interface AnalyticsSummary {
  total_income: number;
  total_expense: number;
  savings: number;
  transaction_count: number;
  category_breakdown: CategoryBreakdown[];
  top_merchants: TopMerchant[];
  monthly_trends: MonthlyTrend[];
  recent_transactions: RecentTransaction[];
}

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/summary");
      return response.data;
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useIntelligentAnalytics() {
  return useQuery({
    queryKey: ["intelligent-analytics"],
    queryFn: async () => {
      const response = await apiClient.get("/analytics/intelligent");
      return response.data;
    },
    staleTime: 5 * 60 * 1000,
  });
}
