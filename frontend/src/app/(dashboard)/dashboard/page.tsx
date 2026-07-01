"use client";

import { useAuth } from "@/providers/auth-provider";
import { useUser } from "@/hooks/use-user";
import { profileUpdateSchema, type ProfileUpdateFormData } from "@/lib/validators";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useState, useEffect } from "react";
import { Sparkles, Loader2, CheckCircle2, AlertCircle, IndianRupee, Globe, Calendar } from "lucide-react";
import { motion } from "framer-motion";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring" as const, stiffness: 300, damping: 24 }
  }
};

export default function DashboardPage() {
  const { user } = useAuth();
  const { updateProfile, isUpdating } = useUser();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ProfileUpdateFormData>({
    resolver: zodResolver(profileUpdateSchema),
  });

  // Pre-fill profile form fields when user data changes
  useEffect(() => {
    if (user) {
      setValue("full_name", user.full_name);
      setValue("monthly_income", user.monthly_income ?? 0);
      setValue("currency", user.currency);
    }
  }, [user, setValue]);

  const onSubmit = async (data: ProfileUpdateFormData) => {
    setSuccessMsg(null);
    setErrorMsg(null);
    try {
      await updateProfile(data);
      setSuccessMsg("Profile updated successfully!");
      // Clear success alert after 3 seconds
      setTimeout(() => setSuccessMsg(null), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to update profile.");
    }
  };

  const formattedDate = user?.created_at
    ? new Date(user.created_at).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "";

  return (
    <motion.div 
      className="space-y-8"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Welcome Banner */}
      <motion.div variants={itemVariants} className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-100 via-purple-50 to-background dark:from-emerald-950/40 dark:via-purple-900/30 dark:to-background border border-emerald-200 dark:border-emerald-700/20 p-8 shadow-sm transition-all hover:shadow-md">
        <div className="absolute right-0 top-0 h-40 w-40 rounded-full bg-emerald-700/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 space-y-2">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 dark:bg-emerald-700/10 border border-emerald-200 dark:border-emerald-700/20 px-3 py-1 text-xs font-semibold text-emerald-800 dark:text-teal-300"
          >
            <Sparkles className="h-3.5 w-3.5" /> AI Engine Online
          </motion.div>
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl text-slate-900 dark:text-slate-100">
            Welcome to your PocketPilot, {user?.full_name}!
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm max-w-xl font-light">
            Your personal finance copilot is active. Below, verify your profile metrics, update your budget configurations, or prepare for advanced projections.
          </p>
        </div>
      </motion.div>

      {/* Metrics Row */}
      <motion.div variants={itemVariants} className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="border-border bg-card/50 hover:bg-card/80 transition-colors shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Monthly Budget Income</CardTitle>
              <IndianRupee className="h-4 w-4 text-emerald-600 dark:text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">
                {user?.monthly_income !== null && user?.monthly_income !== undefined
                  ? new Intl.NumberFormat(undefined, {
                      style: "currency",
                      currency: user.currency,
                    }).format(user.monthly_income)
                  : "Not Configured"}
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Used for saving and expense targets</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }}>
          <Card className="border-border bg-card/50 hover:bg-card/80 transition-colors shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Preferred Currency</CardTitle>
              <Globe className="h-4 w-4 text-emerald-600 dark:text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold uppercase text-foreground">{user?.currency || "INR"}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Default ISO-4217 code for transactions</p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div whileHover={{ y: -5 }} transition={{ type: "spring", stiffness: 300 }} className="sm:col-span-2 lg:col-span-1">
          <Card className="border-border bg-card/50 hover:bg-card/80 transition-colors shadow-sm h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-xs font-medium text-muted-foreground">Pilot Created At</CardTitle>
              <Calendar className="h-4 w-4 text-emerald-600 dark:text-teal-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{formattedDate}</div>
              <p className="text-[10px] text-muted-foreground mt-1">Date when your copilot was generated</p>
            </CardContent>
          </Card>
        </motion.div>
      </motion.div>

      {/* Profile Update Settings */}
      <motion.div variants={itemVariants}>
        <Card className="border-border bg-card/50 shadow-sm max-w-2xl transition-all hover:shadow-md">
          <CardHeader>
            <CardTitle>Budget Settings</CardTitle>
            <CardDescription>Update your personal metrics to train your AI copilot models</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-6 pt-2">
              {successMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 rounded-lg bg-emerald-100 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 p-3 text-sm text-emerald-800 dark:text-emerald-400"
                >
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  <span>{successMsg}</span>
                </motion.div>
              )}
              {errorMsg && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="flex items-center gap-2 rounded-lg bg-red-100 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 p-3 text-sm text-red-800 dark:text-red-400"
                >
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{errorMsg}</span>
                </motion.div>
              )}

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  type="text"
                  placeholder="Jane Doe"
                  className="bg-background border-input focus:border-emerald-600 transition-colors"
                  {...register("full_name")}
                />
                {errors.full_name && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.full_name.message}</p>
                )}
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="monthly_income">Monthly Income</Label>
                  <Input
                    id="monthly_income"
                    type="number"
                    step="0.01"
                    placeholder="5000"
                    className="bg-background border-input focus:border-emerald-600 transition-colors"
                    {...register("monthly_income", { valueAsNumber: true })}
                  />
                  {errors.monthly_income && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.monthly_income.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="currency">Currency Code</Label>
                  <Input
                    id="currency"
                    type="text"
                    placeholder="INR"
                    className="bg-background border-input focus:border-emerald-600 transition-colors uppercase"
                    {...register("currency")}
                  />
                  {errors.currency && (
                    <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.currency.message}</p>
                  )}
                </div>
              </div>
            </CardContent>
            
            <CardFooter className="flex justify-end border-t border-border bg-muted/10 px-6 py-4">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-emerald-700 hover:bg-emerald-600 text-white shadow-md transition-all px-8 py-2 h-auto font-semibold"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                    </>
                  ) : (
                    "Save Configuration"
                  )}
                </Button>
              </motion.div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </motion.div>
  );
}
