"use client";

import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { useEffect, useState } from "react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return <div className="h-9 w-9" />;
  }

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
      title="Toggle Theme"
      className="text-muted-foreground hover:text-foreground"
    >
      {theme === "dark" ? (
        <Sun className="h-5 w-5 transition-all text-yellow-500 animate-spin-slow" />
      ) : (
        <Moon className="h-5 w-5 transition-all text-emerald-700" />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  );
}
