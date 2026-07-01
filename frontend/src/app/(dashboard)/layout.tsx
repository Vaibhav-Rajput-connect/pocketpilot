"use client";

import { useAuth } from "@/providers/auth-provider";
import { Sidebar } from "@/components/layout/sidebar";
import { Navbar } from "@/components/layout/navbar";
import { Loader2 } from "lucide-react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-950 text-slate-100 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-600" />
        <p className="text-sm text-muted-foreground font-medium animate-pulse">
          Loading PocketPilot...
        </p>
      </div>
    );
  }

  if (!user) {
    return null; // The AuthProvider router logic will redirect to /login
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-foreground">
      {/* Sidebar - hidden on mobile, visible on desktop */}
      <Sidebar className="hidden md:flex shrink-0" />

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-y-auto bg-accent/5 px-6 py-8">
          <div className="mx-auto max-w-7xl w-full space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
