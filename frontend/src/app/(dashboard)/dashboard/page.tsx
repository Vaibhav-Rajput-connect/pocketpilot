"use client";

import { useAnalytics } from "@/hooks/use-analytics";
import { useAuth } from "@/providers/auth-provider";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import {
  IndianRupee,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Receipt,
  Loader2,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar,
  Legend,
} from "recharts";

// ── Color palette for charts ──
const CATEGORY_COLORS: Record<string, string> = {
  Food: "#f97316",
  Transport: "#3b82f6",
  Shopping: "#8b5cf6",
  Bills: "#ef4444",
  Entertainment: "#ec4899",
  Healthcare: "#14b8a6",
  Salary: "#22c55e",
  Investment: "#eab308",
  Education: "#6366f1",
  Travel: "#06b6d4",
  Others: "#64748b",
  Uncategorized: "#94a3b8",
};

const PIE_COLORS = [
  "#f97316", "#3b82f6", "#8b5cf6", "#ef4444", "#ec4899",
  "#14b8a6", "#22c55e", "#eab308", "#6366f1", "#06b6d4", "#64748b",
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
};

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

function formatCompact(val: number): string {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(1)}K`;
  return `₹${val.toFixed(0)}`;
}

// ── Custom tooltip ──
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border border-border/50 bg-card/95 backdrop-blur-md px-3 py-2 shadow-xl text-xs">
      <p className="font-semibold text-foreground mb-1">{label}</p>
      {payload.map((entry: any, i: number) => (
        <p key={i} style={{ color: entry.color }} className="flex items-center gap-1">
          <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: entry.color }} />
          {entry.name}: {formatCurrency(entry.value)}
        </p>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { data: analytics, isLoading } = useAnalytics();

  if (isLoading || !analytics) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-[120px] w-full rounded-xl" />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-5">
          <Skeleton className="h-[320px] lg:col-span-2 rounded-xl" />
          <Skeleton className="h-[320px] lg:col-span-3 rounded-xl" />
        </div>
      </div>
    );
  }

  const {
    total_income,
    total_expense,
    savings,
    transaction_count,
    category_breakdown,
    top_merchants,
    monthly_trends,
    recent_transactions,
  } = analytics;

  const statsCards = [
    {
      title: "Total Expense",
      value: formatCurrency(total_expense),
      icon: TrendingDown,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
      borderColor: "border-red-500/20",
    },
    {
      title: "Total Income",
      value: formatCurrency(total_income),
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      borderColor: "border-emerald-500/20",
    },
    {
      title: "Net Savings",
      value: formatCurrency(savings),
      icon: PiggyBank,
      color: savings >= 0 ? "text-emerald-500" : "text-red-500",
      bgColor: savings >= 0 ? "bg-emerald-500/10" : "bg-red-500/10",
      borderColor: savings >= 0 ? "border-emerald-500/20" : "border-red-500/20",
    },
    {
      title: "Transactions",
      value: transaction_count.toString(),
      icon: Receipt,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      borderColor: "border-blue-500/20",
    },
  ];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* ── Welcome ── */}
      <motion.div variants={itemVariants}>
        <h1 className="text-2xl font-bold tracking-tight">
          Welcome back, {user?.full_name?.split(" ")[0]}!
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Here&apos;s your financial overview at a glance.
        </p>
      </motion.div>

      {transaction_count === 0 ? (
        <motion.div variants={itemVariants} className="pt-10">
          <EmptyState 
            icon={Receipt} 
            title="No financial data yet" 
            description="You haven't added any transactions. Start tracking your expenses and income to see powerful AI analytics." 
          />
        </motion.div>
      ) : (
        <>
          {/* ── Stats Cards ── */}
      <motion.div variants={itemVariants} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statsCards.map((card) => {
          const Icon = card.icon;
          return (
            <motion.div key={card.title} whileHover={{ y: -4 }} transition={{ type: "spring", stiffness: 300 }}>
              <Card className={`border ${card.borderColor} bg-card/60 backdrop-blur-sm hover:bg-card/80 transition-all shadow-sm`}>
                <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                  <CardTitle className="text-xs font-medium text-muted-foreground">
                    {card.title}
                  </CardTitle>
                  <div className={`rounded-lg p-2 ${card.bgColor}`}>
                    <Icon className={`h-4 w-4 ${card.color}`} />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-foreground">
                    {card.value}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </motion.div>

      {/* ── Charts Row ── */}
      <div className="grid gap-6 lg:grid-cols-5">
        {/* Category Breakdown — Pie/Donut */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Spending by Category
              </CardTitle>
            </CardHeader>
            <CardContent>
              {category_breakdown.length === 0 ? (
                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                  No expense data yet
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  <ResponsiveContainer width="100%" height={250}>
                    <PieChart>
                      <Pie
                        data={category_breakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={3}
                        dataKey="total"
                        nameKey="category"
                        stroke="none"
                      >
                        {category_breakdown.map((entry, index) => (
                          <Cell
                            key={entry.category}
                            fill={CATEGORY_COLORS[entry.category] || PIE_COLORS[index % PIE_COLORS.length]}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        content={({ active, payload }) => {
                          if (!active || !payload?.length) return null;
                          const d = payload[0].payload;
                          return (
                            <div className="rounded-lg border border-border/50 bg-card/95 backdrop-blur-md px-3 py-2 shadow-xl text-xs">
                              <p className="font-semibold">{d.category}</p>
                              <p className="text-muted-foreground">
                                {formatCurrency(d.total)} · {d.percentage}%
                              </p>
                            </div>
                          );
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Legend */}
                  <div className="flex flex-wrap gap-x-4 gap-y-1.5 mt-2 justify-center">
                    {category_breakdown.slice(0, 6).map((entry, i) => (
                      <div key={entry.category} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span
                          className="inline-block w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: CATEGORY_COLORS[entry.category] || PIE_COLORS[i % PIE_COLORS.length] }}
                        />
                        {entry.category}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Monthly Trends — Area Chart */}
        <motion.div variants={itemVariants} className="lg:col-span-3">
          <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm h-full">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Monthly Trends
              </CardTitle>
            </CardHeader>
            <CardContent>
              {monthly_trends.length === 0 ? (
                <div className="flex h-[250px] items-center justify-center text-sm text-muted-foreground">
                  No monthly data yet
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={monthly_trends} margin={{ top: 5, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <YAxis tickFormatter={(v) => formatCompact(v)} tick={{ fontSize: 11 }} stroke="hsl(var(--muted-foreground))" />
                    <Tooltip content={<ChartTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="income"
                      name="Income"
                      stroke="#22c55e"
                      fill="url(#incomeGrad)"
                      strokeWidth={2}
                    />
                    <Area
                      type="monotone"
                      dataKey="expense"
                      name="Expense"
                      stroke="#ef4444"
                      fill="url(#expenseGrad)"
                      strokeWidth={2}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: "12px", paddingTop: "8px" }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Bottom Row ── */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Merchants — Bar Chart */}
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Top Merchants
              </CardTitle>
            </CardHeader>
            <CardContent>
              {top_merchants.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  No merchant data yet
                </div>
              ) : (
                <div className="space-y-3">
                  {top_merchants.map((m, i) => {
                    const maxTotal = top_merchants[0]?.total || 1;
                    const pct = (m.total / maxTotal) * 100;
                    return (
                      <div key={m.merchant} className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="font-medium text-foreground truncate max-w-[200px]">
                            {m.merchant}
                          </span>
                          <span className="text-muted-foreground text-xs">
                            {formatCurrency(m.total)} · {m.count} txn{m.count > 1 ? "s" : ""}
                          </span>
                        </div>
                        <div className="h-2 rounded-full bg-muted/50 overflow-hidden">
                          <motion.div
                            className="h-full rounded-full"
                            style={{
                              background: `linear-gradient(90deg, ${PIE_COLORS[i % PIE_COLORS.length]}, ${PIE_COLORS[i % PIE_COLORS.length]}88)`,
                            }}
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.8, delay: i * 0.1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        {/* Recent Transactions */}
        <motion.div variants={itemVariants}>
          <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold">
                Recent Transactions
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recent_transactions.length === 0 ? (
                <div className="flex h-[200px] items-center justify-center text-sm text-muted-foreground">
                  No transactions yet. Upload a statement to get started.
                </div>
              ) : (
                <div className="space-y-3">
                  {recent_transactions.map((t) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between py-2 border-b border-border/30 last:border-0"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div
                          className={`rounded-full p-1.5 ${
                            t.transaction_type === "credit"
                              ? "bg-emerald-500/10 text-emerald-500"
                              : "bg-red-500/10 text-red-500"
                          }`}
                        >
                          {t.transaction_type === "credit" ? (
                            <ArrowUpRight className="h-3.5 w-3.5" />
                          ) : (
                            <ArrowDownRight className="h-3.5 w-3.5" />
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {t.merchant || "Unknown"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(t.date).toLocaleDateString("en-IN", {
                              day: "numeric",
                              month: "short",
                            })}{" "}
                            ·{" "}
                            <span
                              className="inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold"
                              style={{
                                backgroundColor: `${CATEGORY_COLORS[t.category || "Others"]}20`,
                                color: CATEGORY_COLORS[t.category || "Others"],
                              }}
                            >
                              {t.category}
                            </span>
                          </p>
                        </div>
                      </div>
                      <span
                        className={`text-sm font-bold whitespace-nowrap ${
                          t.transaction_type === "credit"
                            ? "text-emerald-500"
                            : "text-red-500"
                        }`}
                      >
                        {t.transaction_type === "credit" ? "+" : "-"}
                        {formatCurrency(t.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        </>
      )}
    </motion.div>
  );
}
