"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/providers/auth-provider";
import { loginSchema, type LoginFormData } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from "react";
import { AlertCircle, Sparkles, Loader2, ArrowLeft } from "lucide-react";
import { motion } from "framer-motion";

export default function LoginPage() {
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginFormData) => {
    setErrorMsg(null);
    setIsSubmitting(true);
    try {
      await login(data);
    } catch (err: any) {
      setErrorMsg(err.message || "Invalid credentials. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative min-h-screen bg-background flex flex-col justify-center items-center px-4 overflow-hidden">
      {/* Background blobs */}
      <div className="absolute -top-[20%] -left-[10%] h-[60%] w-[50%] rounded-full bg-emerald-700/10 dark:bg-emerald-900/10 blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-[20%] -right-[10%] h-[60%] w-[50%] rounded-full bg-teal-500/10 dark:bg-teal-900/10 blur-[100px] pointer-events-none" />

      <Link href="/" className="absolute top-6 left-6 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft className="h-4 w-4" /> Back Home
      </Link>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="flex flex-col items-center gap-2 mb-8 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: "spring" }}
            className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-700 text-white shadow-xl shadow-emerald-700/10"
          >
            <Sparkles className="h-6 w-6 text-emerald-100 animate-pulse" />
          </motion.div>
          <motion.h2 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-3xl font-extrabold bg-gradient-to-r from-emerald-600 to-teal-400 dark:from-teal-500 dark:to-teal-300 bg-clip-text text-transparent"
          >
            PocketPilot
          </motion.h2>
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="text-sm text-muted-foreground"
          >
            Sign in to manage your financial portfolio
          </motion.p>
        </div>

        <Card className="border-border/80 bg-card/60 backdrop-blur-xl shadow-xl">
          <CardHeader>
            <CardTitle className="text-xl font-bold">Welcome Back</CardTitle>
            <CardDescription className="text-muted-foreground">Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="flex flex-col gap-5 pt-4 pb-6">
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
                <Label htmlFor="email" className="text-foreground font-medium">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="bg-background/50 border-input focus:border-emerald-600 transition-colors"
                  {...register("email")}
                />
                {errors.email && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password" className="text-foreground font-medium">Password</Label>
                  <span className="text-xs text-emerald-600 dark:text-teal-500 hover:underline cursor-pointer transition-colors">Forgot?</span>
                </div>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  className="bg-background/50 border-input focus:border-emerald-600 transition-colors"
                  {...register("password")}
                />
                {errors.password && (
                  <p className="text-xs text-red-500 dark:text-red-400 mt-1">{errors.password.message}</p>
                )}
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4 pt-6 pb-6">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-emerald-700 hover:bg-emerald-600 text-white transition-all shadow-md"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Authenticating...
                    </>
                  ) : (
                    "Sign In"
                  )}
                </Button>
              </motion.div>
              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="text-emerald-600 dark:text-teal-500 hover:underline font-semibold transition-colors">
                  Sign up
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}
