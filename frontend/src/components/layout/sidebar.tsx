"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/auth-provider";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  LayoutDashboard,
  Wallet,
  TrendingUp,
  BrainCircuit,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";
import { motion } from "framer-motion";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/dashboard/transactions", label: "Transactions", icon: Wallet, disabled: true },
    { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp, disabled: true },
    { href: "/dashboard/copilot", label: "AI Copilot", icon: BrainCircuit, disabled: true },
    { href: "/dashboard/settings", label: "Settings", icon: Settings, disabled: true },
  ];

  return (
    <aside
      className={cn(
        "flex h-screen w-64 flex-col border-r border-border bg-card/50 backdrop-blur-md px-4 py-6 text-foreground",
        className
      )}
    >
      <div className="flex items-center gap-2 px-2 py-4">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
          <Sparkles className="h-5 w-5 text-teal-500 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight bg-gradient-to-r from-teal-500 to-teal-300 bg-clip-text text-transparent">
            PocketPilot
          </h1>
          <p className="text-xs text-muted-foreground font-semibold">AI Finance Copilot</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1.5 py-6">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <div key={item.href} className="relative">
              {item.disabled ? (
                <div className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-foreground/50 cursor-not-allowed group">
                  <Icon className="h-4 w-4" />
                  <span>{item.label}</span>
                  <span className="ml-auto text-[10px] bg-muted px-1.5 py-0.5 rounded text-foreground/60 font-bold">
                    Soon
                  </span>
                </div>
              ) : (
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all hover:bg-accent hover:text-accent-foreground",
                    isActive ? "bg-primary/15 text-primary font-bold" : "text-foreground/70 font-semibold"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="active-indicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 rounded-r bg-primary"
                      transition={{ type: "spring", stiffness: 380, damping: 30 }}
                    />
                  )}
                  <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-foreground/70")} />
                  <span>{item.label}</span>
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {user && (
        <div className="border-t border-border pt-4">
          <div className="flex items-center gap-3 px-2 py-3 rounded-lg bg-accent/20 mb-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
              {user.full_name.charAt(0).toUpperCase()}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium truncate">{user.full_name}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          </div>
          <Button
            onClick={logout}
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:bg-destructive/10 hover:text-destructive gap-3"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      )}
    </aside>
  );
}
