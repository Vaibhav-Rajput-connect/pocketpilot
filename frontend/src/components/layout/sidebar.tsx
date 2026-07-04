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
  Bot,
  Receipt,
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
    { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/dashboard/transactions", label: "Transactions", icon: Receipt },
    { href: "/dashboard/analytics", label: "Analytics", icon: TrendingUp },
    { href: "/dashboard/copilot", label: "AI Copilot", icon: Bot },
    { href: "/dashboard/settings", label: "Settings", icon: Settings },
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
          <Sparkles className="h-5 w-5 animate-pulse text-white" />
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
              <Link
                href={item.href}
                className={cn(
                  "relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors z-10",
                  isActive ? "text-primary-foreground font-semibold" : "text-foreground/70 font-medium hover:text-foreground"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active-pill"
                    className="absolute inset-0 rounded-lg bg-primary -z-10 shadow-sm"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Icon className={cn("h-4 w-4 relative z-10", isActive ? "text-primary-foreground" : "text-foreground/70")} />
                <span className="relative z-10">{item.label}</span>
              </Link>
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
