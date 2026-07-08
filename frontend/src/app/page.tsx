"use client";

import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Sparkles,
  BrainCircuit,
  ShieldCheck,
  Zap,
  ArrowRight,
  GitBranch,
  TrendingUp,
  PiggyBank,
  BarChart3,
} from "lucide-react";
import { motion, useMotionValue, useTransform, useSpring } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/auth-provider";

import { HeroScene } from "@/components/three/HeroScene";

/* ── Stats Counter ── */
const stats = [
  { label: "Active Users", value: "12,000+", icon: TrendingUp },
  { label: "Expenses Tracked", value: "₹2.4Cr+", icon: PiggyBank },
  { label: "AI Insights", value: "50,000+", icon: BarChart3 },
];

/* ── Feature Data ── */
const features = [
  {
    icon: BrainCircuit,
    title: "AI Copilot",
    description:
      "Chat naturally with your financial assistant. Ask questions, request forecasts, or discover hidden saving opportunities.",
  },
  {
    icon: Zap,
    title: "Smart Forecasting",
    description:
      "ML-powered engines forecast your balance, recurring charges, and future spending trends with high confidence.",
  },
  {
    icon: ShieldCheck,
    title: "Bank-Grade Security",
    description:
      "Production-ready JWT authentication, bcrypt password hashing, and end-to-end encryption for your financial data.",
  },
];

export default function LandingPage() {
  const { user, isLoading } = useAuth();
  const isLoggedIn = !isLoading && user !== null;

  // Parallax setup for hologram effect
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [10, -10]), { damping: 30, stiffness: 100 });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), { damping: 30, stiffness: 100 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = e.clientX / window.innerWidth - 0.5;
      const y = e.clientY / window.innerHeight - 0.5;
      mouseX.set(x);
      mouseY.set(y);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, [mouseX, mouseY]);

  return (
    <div className="relative min-h-screen overflow-hidden bg-background text-foreground flex flex-col">
      {/* ── Background Layers ── */}
      <HeroScene />

      {/* Radial glow behind hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-primary/10 rounded-full blur-[200px] z-[1] pointer-events-none" />
      <div className="absolute top-[15%] right-[-5%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] z-[1] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-primary/5 rounded-full blur-[120px] z-[1] pointer-events-none" />

      {/* ── Header ── */}
      <header className="relative z-10 flex h-20 items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-card border border-border shadow-lg shadow-primary/20"
          >
            <Sparkles className="h-5 w-5 text-primary" />
          </motion.div>
          <span className="text-xl font-extrabold tracking-tight text-foreground">
            PocketPilot
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-6"
              )}
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-6"
                )}
              >
                Sign Up
              </Link>
            </>
          )}
        </div>
      </header>

      {/* ── Hero Section (Centered like Syncly) ── */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center max-w-5xl mx-auto px-6 py-16 lg:py-24 w-full text-center">
        {/* Animated Logo */}
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
          className="mb-10"
        >
          <div className="relative mx-auto">
            {/* Glow ring */}
            <motion.div
              className="absolute inset-0 rounded-3xl bg-primary/20 blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative h-20 w-20 rounded-3xl bg-card border border-border flex items-center justify-center shadow-2xl shadow-primary/30">
              <Sparkles className="h-10 w-10 text-primary" />
            </div>
          </div>
        </motion.div>

        {/* Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.2] max-w-4xl"
          style={{ fontStyle: "italic" }}
        >
          <span className="text-foreground inline-block">AI-Powered </span>{" "}
          <span className="text-primary inline-block pb-1">
            Personal Finance
          </span>
          <br className="hidden sm:block" />
          <span className="text-foreground inline-block mt-2">for </span>{" "}
          <span className="text-primary inline-block pb-1 mt-2">
            Individuals
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-2xl font-light leading-relaxed"
        >
          Take control of your money with AI-powered insights, smart budgeting,
          and spending forecasts.
        </motion.p>

        {/* CTA Buttons Row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
        >
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "default", size: "lg" }),
                "bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-8 py-3 h-auto shadow-xl shadow-primary/20 group text-base"
              )}
            >
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ variant: "default", size: "lg" }),
                  "bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-8 py-3 h-auto shadow-xl shadow-primary/20 group text-base"
                )}
              >
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-border text-foreground hover:bg-accent rounded-full px-8 py-3 h-auto font-semibold text-base"
                )}
              >
                Sign In
              </Link>
            </>
          )}
        </motion.div>

        {/* ── Dashboard Preview Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 40, rotateX: 10 }}
          animate={{ opacity: 1, y: 0, rotateX: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-20 w-full max-w-3xl relative perspective-1000"
          style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
        >
          {/* Glow behind card */}
          <div className="absolute -inset-4 bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 rounded-3xl blur-2xl" />

          <div className="relative rounded-2xl border border-border bg-card/80 backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-border bg-card">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-muted-foreground font-mono ml-4">pocketpilot.app/dashboard</span>
            </div>

            <div className="p-6 space-y-5">
              {/* Net Worth Banner */}
              <div className="flex justify-between items-center bg-background/60 p-5 rounded-xl border border-border">
                <div>
                  <p className="text-xs text-muted-foreground font-semibold tracking-wider">TOTAL BALANCE</p>
                  <p className="text-3xl font-extrabold text-foreground mt-1">₹2,48,920</p>
                </div>
                <div className="flex items-center gap-1.5 text-primary text-sm font-bold bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20">
                  <TrendingUp className="h-3.5 w-3.5" /> +12.4%
                </div>
              </div>

              {/* AI Insight */}
              <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 space-y-2">
                <div className="flex items-center gap-2 text-primary text-sm font-bold">
                  <BrainCircuit className="h-4 w-4 animate-pulse" />
                  <span>AI Copilot Insight</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  &quot;Your dining expenses rose 14% this month. To hit your ₹8,000 savings target, cap dining at ₹2,500.&quot;
                </p>
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-background/60 rounded-xl border border-border text-center">
                  <p className="text-[10px] text-muted-foreground font-medium tracking-wider">INCOME</p>
                  <p className="text-sm font-bold text-foreground mt-1">₹65,000</p>
                </div>
                <div className="p-3 bg-background/60 rounded-xl border border-border text-center">
                  <p className="text-[10px] text-muted-foreground font-medium tracking-wider">SPENT</p>
                  <p className="text-sm font-bold text-red-400 mt-1">₹42,080</p>
                </div>
                <div className="p-3 bg-background/60 rounded-xl border border-border text-center">
                  <p className="text-[10px] text-muted-foreground font-medium tracking-wider">SAVED</p>
                  <p className="text-sm font-bold text-primary mt-1">₹22,920</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </main>

      {/* ── Features Section ── */}
      <section id="features" className="relative z-10 max-w-5xl mx-auto px-6 pb-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Everything you need to{" "}
            <span className="text-primary">
              master your money
            </span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            Powerful AI features designed for the modern Indian saver and spender.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="group relative bg-card/60 border border-border p-7 rounded-2xl hover:border-primary/30 hover:bg-card/80 transition-all duration-300"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-300">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground mt-5">{feature.title}</h3>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed font-light">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="relative z-10 max-w-5xl mx-auto px-6 pb-24 w-full">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
            Get started in{" "}
            <span className="text-primary">
              3 simple steps
            </span>
          </h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {[
            { step: "01", title: "Create Account", desc: "Sign up in seconds with just your email and a password." },
            { step: "02", title: "Set Your Budget", desc: "Configure your monthly income and savings goals." },
            { step: "03", title: "Let AI Work", desc: "Get intelligent insights, forecasts, and spending recommendations." },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.15 }}
              className="text-center"
            >
              <div className="text-5xl font-black text-primary/20 mb-4">{item.step}</div>
              <h3 className="text-lg font-bold text-foreground">{item.title}</h3>
              <p className="text-sm text-muted-foreground mt-2 font-light">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 pb-24 w-full">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-3xl border border-primary/20 bg-card p-12 text-center overflow-hidden shadow-2xl"
        >
          <div className="absolute inset-0 bg-primary/5 rounded-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-foreground">
              Ready to pilot your finances?
            </h2>
            <p className="text-muted-foreground mt-4 max-w-lg mx-auto">
              Join thousands of users who are already taking control of their money with PocketPilot.
            </p>
            <div className="mt-8">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-10 py-3 h-auto shadow-xl shadow-primary/20 group text-base"
                  )}
                >
                  Go to Dashboard
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-full px-10 py-3 h-auto shadow-xl shadow-primary/20 group text-base"
                  )}
                >
                  Get Started for Free
                  <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-12 py-8 border-t border-border flex flex-col sm:flex-row justify-center items-center gap-4 text-xs text-muted-foreground">
        <p>© 2026 PocketPilot Technologies Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
