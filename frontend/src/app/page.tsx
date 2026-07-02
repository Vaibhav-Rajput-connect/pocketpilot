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
import { motion } from "framer-motion";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "@/providers/auth-provider";

/* ── Animated Dot Grid Background ── */
function AnimatedDotGrid() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let mouseX = -1000;
    let mouseY = -1000;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight * 3;
    };
    resize();
    window.addEventListener("resize", resize);

    const handleMouse = (e: MouseEvent) => {
      mouseX = e.clientX;
      mouseY = e.clientY + window.scrollY;
    };
    window.addEventListener("mousemove", handleMouse);

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spacing = 35;
      const cols = Math.ceil(canvas.width / spacing) + 1;
      const rows = Math.ceil(canvas.height / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const baseX = i * spacing;
          const baseY = j * spacing;

          // Distance from center
          const cx = canvas.width / 2;
          const cy = canvas.height / 3;
          const dist = Math.sqrt((baseX - cx) ** 2 + (baseY - cy) ** 2);
          const maxDist = Math.sqrt(cx ** 2 + cy ** 2);

          // Wave displacement — dots physically move
          const waveX = Math.sin(baseY * 0.015 + time * 1.5) * 4 + Math.sin(baseX * 0.008 + time * 0.8) * 2;
          const waveY = Math.cos(baseX * 0.012 + time * 1.2) * 5 + Math.sin(dist * 0.008 - time * 0.6) * 3;

          const x = baseX + waveX;
          const y = baseY + waveY;

          // Mouse proximity glow
          const mouseDist = Math.sqrt((x - mouseX) ** 2 + (y - mouseY) ** 2);
          const mouseGlow = Math.max(0, 1 - mouseDist / 200);

          // Ripple wave for opacity/size
          const wave = Math.sin(dist * 0.012 - time * 1.2) * 0.5 + 0.5;
          const baseOpacity = 0.08 + wave * 0.25 * (1 - dist / maxDist * 0.7);
          const opacity = Math.min(1, baseOpacity + mouseGlow * 0.5);
          const radius = 1.3 + wave * 1.5 + mouseGlow * 3;

          ctx.beginPath();
          ctx.arc(x, y, radius, 0, Math.PI * 2);

          if (mouseGlow > 0.1) {
            ctx.fillStyle = `rgba(34, 197, 94, ${opacity})`;
          } else {
            ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
          }
          ctx.fill();
        }
      }

      // Draw faint grid lines
      ctx.strokeStyle = "rgba(16, 185, 129, 0.03)";
      ctx.lineWidth = 0.5;
      for (let i = 0; i < cols; i++) {
        ctx.beginPath();
        ctx.moveTo(i * spacing, 0);
        ctx.lineTo(i * spacing, canvas.height);
        ctx.stroke();
      }
      for (let j = 0; j < rows; j++) {
        ctx.beginPath();
        ctx.moveTo(0, j * spacing);
        ctx.lineTo(canvas.width, j * spacing);
        ctx.stroke();
      }

      time += 0.016;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("resize", resize);
      window.removeEventListener("mousemove", handleMouse);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 1 }}
    />
  );
}

/* ── Floating Orbs ── */
function FloatingOrbs() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {/* Large slow-moving orbs */}
      <motion.div
        className="absolute w-[500px] h-[500px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(16,185,129,0.12) 0%, transparent 70%)" }}
        animate={{
          x: [-100, 100, -100],
          y: [-50, 80, -50],
        }}
        transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
        initial={{ top: "10%", left: "5%" }}
      />
      <motion.div
        className="absolute w-[400px] h-[400px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(20,184,166,0.10) 0%, transparent 70%)" }}
        animate={{
          x: [80, -80, 80],
          y: [40, -60, 40],
        }}
        transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
        initial={{ top: "30%", right: "0%" }}
      />
      <motion.div
        className="absolute w-[350px] h-[350px] rounded-full"
        style={{ background: "radial-gradient(circle, rgba(34,197,94,0.08) 0%, transparent 70%)" }}
        animate={{
          x: [-60, 60, -60],
          y: [30, -40, 30],
        }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        initial={{ bottom: "10%", left: "30%" }}
      />

      {/* Smaller bright particles */}
      {Array.from({ length: 30 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: Math.random() * 4 + 2,
            height: Math.random() * 4 + 2,
            background: `rgba(16, 185, 129, ${Math.random() * 0.4 + 0.2})`,
            boxShadow: `0 0 ${Math.random() * 8 + 4}px rgba(16, 185, 129, 0.3)`,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [0, -(Math.random() * 60 + 30), 0],
            x: [0, Math.random() * 40 - 20, 0],
            opacity: [0.1, 0.7, 0.1],
            scale: [1, 1.5, 1],
          }}
          transition={{
            duration: Math.random() * 10 + 8,
            delay: Math.random() * 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
}

function ShootingMeteors() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed inset-0 z-[1] pointer-events-none overflow-hidden">
      {Array.from({ length: 4 }, (_, i) => (
        <motion.div
          key={i}
          className="absolute h-[1px] rounded-full"
          style={{
            width: Math.random() * 100 + 80,
            background: "linear-gradient(90deg, rgba(16,185,129,0.6), transparent)",
            top: `${Math.random() * 50 + 5}%`,
            left: "-10%",
            rotate: -35,
          }}
          animate={{
            x: ["0vw", "130vw"],
            opacity: [0, 1, 1, 0],
          }}
          transition={{
            duration: Math.random() * 1.5 + 1,
            delay: Math.random() * 12 + i * 4,
            repeat: Infinity,
            repeatDelay: Math.random() * 15 + 8,
            ease: "linear",
          }}
        />
      ))}
    </div>
  );
}

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

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#020617] text-[#F8FAFC] flex flex-col">
      {/* ── Background Layers ── */}
      <AnimatedDotGrid />
      <FloatingOrbs />
      <ShootingMeteors />

      {/* Radial glow behind hero */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] bg-emerald-600/10 rounded-full blur-[200px] z-[1] pointer-events-none" />
      <div className="absolute top-[15%] right-[-5%] w-[500px] h-[500px] bg-teal-600/8 rounded-full blur-[150px] z-[1] pointer-events-none" />
      <div className="absolute bottom-[10%] left-[-5%] w-[400px] h-[400px] bg-emerald-700/6 rounded-full blur-[120px] z-[1] pointer-events-none" />

      {/* ── Header ── */}
      <header className="relative z-10 flex h-20 items-center justify-between px-6 lg:px-12 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ rotate: -180, opacity: 0 }}
            animate={{ rotate: 0, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0F172A] border border-[#1E293B] shadow-lg shadow-emerald-900/20"
          >
            <Sparkles className="h-5 w-5 text-emerald-400" />
          </motion.div>
          <span className="text-xl font-extrabold tracking-tight text-[#F8FAFC]">
            PocketPilot
          </span>
        </div>

        <div className="flex items-center gap-4">
          {isLoggedIn ? (
            <Link
              href="/dashboard"
              className={cn(
                buttonVariants({ variant: "default" }),
                "bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-bold rounded-full px-6"
              )}
            >
              Go to Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="text-sm font-semibold text-[#94A3B8] hover:text-[#F8FAFC] transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className={cn(
                  buttonVariants({ variant: "default" }),
                  "bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-bold rounded-full px-6"
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
              className="absolute inset-0 rounded-3xl bg-emerald-500/20 blur-xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <div className="relative h-20 w-20 rounded-3xl bg-[#0F172A] border border-[#1E293B] flex items-center justify-center shadow-2xl shadow-emerald-900/30">
              <Sparkles className="h-10 w-10 text-emerald-400" />
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
          <span className="text-[#F8FAFC] inline-block">AI-Powered </span>{" "}
          <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-300 bg-clip-text text-transparent inline-block pb-1">
            Personal Finance
          </span>
          <br className="hidden sm:block" />
          <span className="text-[#F8FAFC] inline-block mt-2">for </span>{" "}
          <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent inline-block pb-1 mt-2">
            Individuals
          </span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="mt-6 text-lg sm:text-xl text-[#94A3B8] max-w-2xl font-light leading-relaxed"
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
                "bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-bold rounded-full px-8 py-3 h-auto shadow-xl shadow-emerald-500/20 group text-base"
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
                  "bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-bold rounded-full px-8 py-3 h-auto shadow-xl shadow-emerald-500/20 group text-base"
                )}
              >
                Create Free Account
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/login"
                className={cn(
                  buttonVariants({ variant: "outline", size: "lg" }),
                  "border-[#1E293B] text-[#F8FAFC] hover:bg-[#0F172A] rounded-full px-8 py-3 h-auto font-semibold text-base"
                )}
              >
                Sign In
              </Link>
            </>
          )}
        </motion.div>

        {/* ── Dashboard Preview Card ── */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
          className="mt-20 w-full max-w-3xl relative"
        >
          {/* Glow behind card */}
          <div className="absolute -inset-4 bg-gradient-to-r from-emerald-600/10 via-teal-500/10 to-emerald-600/10 rounded-3xl blur-2xl" />

          <div className="relative rounded-2xl border border-[#1E293B] bg-[#0F172A]/80 backdrop-blur-xl overflow-hidden shadow-2xl">
            {/* Fake browser bar */}
            <div className="flex items-center gap-2 px-5 py-3 border-b border-[#1E293B] bg-[#0F172A]">
              <span className="h-3 w-3 rounded-full bg-red-500/80" />
              <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
              <span className="h-3 w-3 rounded-full bg-green-500/80" />
              <span className="text-xs text-[#94A3B8] font-mono ml-4">pocketpilot.app/dashboard</span>
            </div>

            <div className="p-6 space-y-5">
              {/* Net Worth Banner */}
              <div className="flex justify-between items-center bg-[#020617]/60 p-5 rounded-xl border border-[#1E293B]">
                <div>
                  <p className="text-xs text-[#94A3B8] font-semibold tracking-wider">TOTAL BALANCE</p>
                  <p className="text-3xl font-extrabold text-[#F8FAFC] mt-1">₹2,48,920</p>
                </div>
                <div className="flex items-center gap-1.5 text-emerald-400 text-sm font-bold bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                  <TrendingUp className="h-3.5 w-3.5" /> +12.4%
                </div>
              </div>

              {/* AI Insight */}
              <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-bold">
                  <BrainCircuit className="h-4 w-4 animate-pulse" />
                  <span>AI Copilot Insight</span>
                </div>
                <p className="text-sm text-[#94A3B8] leading-relaxed">
                  &quot;Your dining expenses rose 14% this month. To hit your ₹8,000 savings target, cap dining at ₹2,500.&quot;
                </p>
              </div>

              {/* Mini Stats */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 bg-[#020617]/60 rounded-xl border border-[#1E293B] text-center">
                  <p className="text-[10px] text-[#94A3B8] font-medium tracking-wider">INCOME</p>
                  <p className="text-sm font-bold text-[#F8FAFC] mt-1">₹65,000</p>
                </div>
                <div className="p-3 bg-[#020617]/60 rounded-xl border border-[#1E293B] text-center">
                  <p className="text-[10px] text-[#94A3B8] font-medium tracking-wider">SPENT</p>
                  <p className="text-sm font-bold text-red-400 mt-1">₹42,080</p>
                </div>
                <div className="p-3 bg-[#020617]/60 rounded-xl border border-[#1E293B] text-center">
                  <p className="text-[10px] text-[#94A3B8] font-medium tracking-wider">SAVED</p>
                  <p className="text-sm font-bold text-emerald-400 mt-1">₹22,920</p>
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
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC]">
            Everything you need to{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              master your money
            </span>
          </h2>
          <p className="text-[#94A3B8] mt-4 max-w-xl mx-auto">
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
              className="group relative bg-[#0F172A]/60 border border-[#1E293B] p-7 rounded-2xl hover:border-emerald-500/30 hover:bg-[#0F172A]/80 transition-all duration-300"
            >
              {/* Hover glow */}
              <div className="absolute inset-0 rounded-2xl bg-emerald-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

              <div className="relative z-10">
                <div className="h-12 w-12 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 group-hover:scale-110 group-hover:bg-emerald-500/20 transition-all duration-300">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-[#F8FAFC] mt-5">{feature.title}</h3>
                <p className="text-sm text-[#94A3B8] mt-2 leading-relaxed font-light">
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
          <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC]">
            Get started in{" "}
            <span className="bg-gradient-to-r from-teal-400 to-emerald-400 bg-clip-text text-transparent">
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
              <div className="text-5xl font-black text-emerald-500/20 mb-4">{item.step}</div>
              <h3 className="text-lg font-bold text-[#F8FAFC]">{item.title}</h3>
              <p className="text-sm text-[#94A3B8] mt-2 font-light">{item.desc}</p>
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
          className="relative rounded-3xl border border-emerald-500/20 bg-gradient-to-br from-[#0F172A] to-[#020617] p-12 text-center overflow-hidden"
        >
          <div className="absolute inset-0 bg-emerald-500/5 rounded-3xl" />
          <div className="relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#F8FAFC]">
              Ready to pilot your finances?
            </h2>
            <p className="text-[#94A3B8] mt-4 max-w-lg mx-auto">
              Join thousands of users who are already taking control of their money with PocketPilot.
            </p>
            <div className="mt-8">
              {isLoggedIn ? (
                <Link
                  href="/dashboard"
                  className={cn(
                    buttonVariants({ variant: "default", size: "lg" }),
                    "bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-bold rounded-full px-10 py-3 h-auto shadow-xl shadow-emerald-500/20 group text-base"
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
                    "bg-emerald-500 hover:bg-emerald-400 text-[#020617] font-bold rounded-full px-10 py-3 h-auto shadow-xl shadow-emerald-500/20 group text-base"
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
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-6 lg:px-12 py-8 border-t border-[#1E293B] flex flex-col sm:flex-row justify-center items-center gap-4 text-xs text-[#94A3B8]">
        <p>© 2026 PocketPilot Technologies Inc. All rights reserved.</p>
      </footer>
    </div>
  );
}
