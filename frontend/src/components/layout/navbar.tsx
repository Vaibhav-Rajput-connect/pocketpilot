"use client";

import Link from "next/link";
import { useAuth } from "@/providers/auth-provider";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu, Sparkles, User as UserIcon, LogOut } from "lucide-react";
import { Sidebar } from "./sidebar";
import { useState } from "react";

export function Navbar() {
  const { user, logout } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 flex h-16 w-full items-center justify-between border-b border-border bg-background/80 backdrop-blur-md px-6">
      <div className="flex items-center gap-4">
        {/* Mobile Sidebar Trigger */}
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
            <Menu className="h-5 w-5" />
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 bg-card">
            <Sidebar className="w-full border-r-0" />
          </SheetContent>
        </Sheet>
        
        <div>
          <h2 className="text-lg font-bold text-foreground md:block hidden tracking-tight">
            Hello, {user?.full_name.split(" ")[0]}! Welcome Back.
          </h2>
          <Link href="/" className="md:hidden flex items-center gap-2 group">
            <Sparkles className="h-5 w-5 text-teal-500 group-hover:scale-110 transition-transform" />
            <span className="font-bold text-lg bg-gradient-to-r from-teal-500 to-teal-300 bg-clip-text text-transparent group-hover:opacity-80 transition-opacity">
              PocketPilot
            </span>
          </Link>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <ThemeToggle />
        
        {user && (
          <DropdownMenu>
            <DropdownMenuTrigger render={<Button variant="ghost" className="relative h-9 w-9 rounded-full bg-primary/10 text-primary hover:bg-primary/20 font-semibold" />}>
              {user.full_name.charAt(0).toUpperCase()}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col space-y-1">
                  <p className="text-sm font-medium leading-none">{user.full_name}</p>
                  <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
                </div>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="gap-2 cursor-pointer">
                <UserIcon className="h-4 w-4" />
                <span>My Profile</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="gap-2 text-destructive focus:bg-destructive/10 focus:text-destructive cursor-pointer">
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
}
