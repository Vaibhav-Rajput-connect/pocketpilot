"use client";

import { useIntelligentAnalytics } from "@/hooks/use-analytics";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Loader2, BrainCircuit, Activity, AlertTriangle, Target, CheckCircle2, TrendingUp, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import dynamic from "next/dynamic";

const ResponsiveContainer = dynamic(() => import("recharts").then(mod => mod.ResponsiveContainer), { ssr: false });
const ComposedChart = dynamic(() => import("recharts").then(mod => mod.ComposedChart), { ssr: false });
const Line = dynamic(() => import("recharts").then(mod => mod.Line), { ssr: false });
const AreaChart = dynamic(() => import("recharts").then(mod => mod.AreaChart), { ssr: false });
const Area = dynamic(() => import("recharts").then(mod => mod.Area), { ssr: false });
const XAxis = dynamic(() => import("recharts").then(mod => mod.XAxis), { ssr: false });
const YAxis = dynamic(() => import("recharts").then(mod => mod.YAxis), { ssr: false });
const CartesianGrid = dynamic(() => import("recharts").then(mod => mod.CartesianGrid), { ssr: false });
const Tooltip = dynamic(() => import("recharts").then(mod => mod.Tooltip), { ssr: false });

import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/ui/empty-state";
import { Receipt } from "lucide-react";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

function formatCurrency(val: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(val);
}

// Radial Progress Component for Health Score
function HealthScoreCircle({ score, status }: { score: number, status: string }) {
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let color = "text-emerald-500";
  let strokeColor = "#22c55e"; // emerald
  if (score < 50) {
    color = "text-red-500";
    strokeColor = "#ef4444"; // red
  } else if (score < 80) {
    color = "text-amber-500";
    strokeColor = "#f59e0b"; // amber
  }

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-40 h-40 transform -rotate-90">
        {/* Background track */}
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="currentColor"
          strokeWidth="12"
          fill="transparent"
          className="text-muted/30"
        />
        {/* Progress */}
        <motion.circle
          cx="80"
          cy="80"
          r={radius}
          stroke={strokeColor}
          strokeWidth="12"
          fill="transparent"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute flex flex-col items-center justify-center text-center">
        <span className={`text-4xl font-bold ${color}`}>{score}</span>
        <span className="text-sm text-muted-foreground font-medium uppercase tracking-wider">{status}</span>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const { data: ai, isLoading, error } = useIntelligentAnalytics();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Skeleton className="h-10 w-10 rounded-xl" />
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="h-[350px] rounded-xl" />
          <Skeleton className="h-[350px] lg:col-span-2 rounded-xl" />
        </div>
        <Skeleton className="h-[450px] rounded-xl" />
      </div>
    );
  }

  if (error || !ai) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <EmptyState 
          icon={AlertTriangle} 
          title="Not enough data" 
          description="Failed to load intelligent analytics. Ensure you have enough transaction data for the AI to analyze." 
        />
      </div>
    );
  }

  const { health_score, anomalies, forecast, budget_recommendations } = ai;
  
  // Prepare forecast data for chart
  const combinedForecastData = [...(forecast.historical || []), ...(forecast.forecast || [])];

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants} className="flex items-center gap-3">
        <div className="p-2.5 bg-primary/10 rounded-xl">
          <BrainCircuit className="w-6 h-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Intelligent Analytics</h1>
          <p className="text-sm text-muted-foreground mt-1">
            AI-powered insights, anomaly detection, and spending forecasts.
          </p>
        </div>
      </motion.div>

      {/* TOP ROW: Health Score & Budget Recommendations */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Health Score */}
        <motion.div variants={itemVariants}>
          <Card className="h-full border-border bg-card/60 backdrop-blur-sm shadow-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4 border-b border-border/50">
              <CardTitle className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-primary" />
                Financial Health
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <HealthScoreCircle score={health_score.score} status={health_score.status} />
              
              <div className="mt-6 space-y-3">
                {health_score.insights.map((insight: any, i: number) => (
                  <div key={i} className="flex gap-3 text-sm items-start">
                    {insight.type === "positive" ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                    ) : insight.type === "warning" ? (
                      <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 shrink-0" />
                    )}
                    <span className="text-muted-foreground leading-snug">{insight.text}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Budget Recommendations */}
        <motion.div variants={itemVariants} className="lg:col-span-2">
          <Card className="h-full border-border bg-card/60 backdrop-blur-sm shadow-sm">
            <CardHeader>
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="w-5 h-5 text-blue-500" />
                    AI Budget Recommendations
                  </CardTitle>
                  <CardDescription className="mt-1">Based on your historical monthly averages</CardDescription>
                </div>
                {budget_recommendations?.length > 0 && (
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">Total Savings Goal</span>
                    <span className="text-lg font-bold text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-sm">
                      +{formatCurrency(
                        budget_recommendations.reduce((acc: number, rec: any) => acc + (rec.current_avg - rec.recommended_budget), 0)
                      )}/mo
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {budget_recommendations?.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {budget_recommendations.slice(0, 6).map((rec: any, idx: number) => {
                    const potentialSavings = rec.current_avg - rec.recommended_budget;
                    return (
                    <div key={idx} className="p-4 rounded-xl border border-border/50 bg-background/50 hover:bg-background transition-colors">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-semibold text-sm">{rec.category}</span>
                        <span className="text-xs px-2 py-1 bg-blue-500/10 text-blue-500 rounded-md font-medium">
                          -5% Goal
                        </span>
                      </div>
                      <div className="flex justify-between text-sm mt-3">
                        <div className="flex flex-col">
                          <span className="text-muted-foreground text-xs">Monthly Avg Spend</span>
                          <span className="font-medium text-red-400">{formatCurrency(rec.current_avg)}/mo</span>
                        </div>
                        <div className="flex flex-col items-end">
                          <span className="text-muted-foreground text-xs">Recommended Budget</span>
                          <span className="font-medium text-emerald-500">{formatCurrency(rec.recommended_budget)}/mo</span>
                        </div>
                      </div>
                      <div className="mt-3 pt-3 border-t border-border/50 flex justify-between items-center">
                        <span className="text-xs text-muted-foreground font-medium">Potential Savings:</span>
                        <span className="text-xs font-bold text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-md">
                          +{formatCurrency(potentialSavings)}/mo
                        </span>
                      </div>
                    </div>
                  )})}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-muted-foreground text-sm">
                  Not enough data for budget recommendations.
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* MIDDLE ROW: Prophet Forecast */}
      <motion.div variants={itemVariants}>
        <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-indigo-500" />
              Spending Forecast (Prophet ML)
            </CardTitle>
            <CardDescription>Predicting your next few months of expenses based on weekly seasonality.</CardDescription>
          </CardHeader>
          <CardContent>
            {combinedForecastData.length > 0 ? (
              <div className="h-[350px] w-full mt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={combinedForecastData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" opacity={0.4} />
                    <XAxis 
                      dataKey="date" 
                      tick={{ fontSize: 11 }} 
                      stroke="hsl(var(--muted-foreground))"
                      tickFormatter={(val) => {
                        const d = new Date(val);
                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                      }}
                    />
                    <YAxis 
                      tick={{ fontSize: 11 }} 
                      stroke="hsl(var(--muted-foreground))" 
                      tickFormatter={(val) => `₹${val/1000}k`}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: 'hsl(var(--card))', borderColor: 'hsl(var(--border))', borderRadius: '8px' }}
                      labelFormatter={(val) => new Date(val).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                      formatter={(value: any, name: any) => [formatCurrency(Number(value)), name === 'actual' ? 'Actual Spend' : name === 'predicted' ? 'Forecast' : 'Confidence Bound']}
                    />
                    
                    {/* Confidence Interval Area */}
                    <Area 
                      type="monotone" 
                      dataKey="upper_bound" 
                      stroke="none" 
                      fill="#6366f1" 
                      fillOpacity={0.1} 
                    />
                    <Area 
                      type="monotone" 
                      dataKey="lower_bound" 
                      stroke="none" 
                      fill="hsl(var(--card))" 
                      fillOpacity={1} 
                    />

                    {/* Historical Line */}
                    <Line 
                      type="monotone" 
                      dataKey="actual" 
                      stroke="#ef4444" 
                      strokeWidth={2} 
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                    
                    {/* Forecast Line */}
                    <Line 
                      type="monotone" 
                      dataKey="predicted" 
                      stroke="#6366f1" 
                      strokeWidth={2} 
                      strokeDasharray="5 5" 
                      dot={false}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
                Need at least 4 weeks of historical data to generate a forecast.
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

      {/* BOTTOM ROW: Anomalies */}
      <motion.div variants={itemVariants}>
        <Card className="border-border bg-card/60 backdrop-blur-sm shadow-sm border-l-4 border-l-rose-500">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-500" />
              Anomaly Detection (Isolation Forest)
            </CardTitle>
            <CardDescription>Unusually large transactions flagged by AI.</CardDescription>
          </CardHeader>
          <CardContent>
            {anomalies?.length > 0 ? (
              <div className="space-y-3">
                {anomalies.map((anom: any) => (
                  <div key={anom.id} className="flex items-center justify-between p-4 rounded-lg bg-rose-500/5 border border-rose-500/10 hover:bg-rose-500/10 transition-colors">
                    <div className="flex flex-col">
                      <span className="font-semibold text-rose-500">{anom.merchant}</span>
                      <span className="text-xs text-muted-foreground mt-1">
                        {new Date(anom.date).toLocaleDateString()} • {anom.reason}
                      </span>
                    </div>
                    <span className="text-lg font-bold text-rose-500">{formatCurrency(anom.amount)}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-24 text-muted-foreground text-sm">
                No anomalies detected in your recent spending. Looking good!
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>

    </motion.div>
  );
}
