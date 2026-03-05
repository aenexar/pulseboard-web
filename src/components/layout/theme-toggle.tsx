"use client";

import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { Monitor, Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";

type Theme = "light" | "dark" | "system";

const options: { value: Theme; icon: React.ElementType; label: string }[] = [
  { value: "light", icon: Sun, label: "Light" },
  { value: "dark", icon: Moon, label: "Dark" },
  { value: "system", icon: Monitor, label: "System" },
];

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timeout);
  }, []);

  if (!mounted) {
    return (
      <div className="flex items-center gap-1 rounded-lg bg-muted p-1 h-8 w-[88px]" />
    );
  }

  return (
    <div
      className={cn(
        "flex items-center gap-1 rounded-lg p-1",
        "bg-muted border border-border",
      )}
      role="group"
      aria-label="Theme selector"
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          type="button"
          key={value}
          onClick={() => setTheme(value)}
          aria-label={`Switch to ${label} theme`}
          className={cn(
            "flex items-center justify-center w-6 h-6 rounded-md transition-all duration-150",
            theme === value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          <Icon className="w-3.5 h-3.5" />
        </button>
      ))}
    </div>
  );
}
