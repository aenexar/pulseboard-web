"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogin } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  BarChart2,
  Lightbulb,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// ─── Animated left panel ──────────────────────────────────────────────────────

function RightPanel() {
  const cards = [
    {
      icon: AlertTriangle,
      color: "text-destructive",
      bg: "bg-destructive/10 border-destructive/20",
      title: "NullPointerException",
      sub: "Spike detected · 42 occurrences",
      pulse: true,
    },
    {
      icon: Lightbulb,
      color: "text-brand",
      bg: "bg-brand/10 border-brand/20",
      title: "AI Insight generated",
      sub: "Memory leak in HomeScreen",
      pulse: false,
    },
    {
      icon: BarChart2,
      color: "text-blue-500",
      bg: "bg-blue-500/10 border-blue-500/20",
      title: "Crash rate dropped",
      sub: "2.4% → 0.8% this week",
      pulse: false,
    },
    {
      icon: Shield,
      color: "text-yellow-500",
      bg: "bg-yellow-500/10 border-yellow-500/20",
      title: "API latency warning",
      sub: "/api/users averaging 1.2s",
      pulse: false,
    },
  ];

  return (
    <div
      className={cn(
        "hidden lg:flex flex-col justify-between",
        "w-1/2 min-h-screen p-12",
        "bg-card border-r border-border relative overflow-hidden",
      )}
    >
      {/* Background grid */}
      <div
        className={cn(
          "absolute inset-0 pointer-events-none",
          "[background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)]",
          "[background-size:32px_32px] opacity-40",
        )}
      />

      {/* Radial gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,hsl(var(--brand)/0.08),transparent_60%)] pointer-events-none" />

      {/* Logo */}
      <div className="relative flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        <span className="text-sm font-mono font-semibold text-foreground">
          PulseBoard
        </span>
      </div>

      {/* Floating cards */}
      <div className="relative flex-1 flex flex-col justify-center gap-3 py-12">
        {cards.map((card, i) => {
          const Icon = card.icon;
          return (
            <div
              key={card.title}
              className={cn(
                "flex items-start gap-3 p-4 rounded-xl border bg-background/80 backdrop-blur",
                "shadow-sm transition-all duration-700",
                "hover:scale-[1.02] hover:shadow-md cursor-default",
                i === 0 && "translate-x-0",
                i === 1 && "translate-x-4",
                i === 2 && "translate-x-2",
                i === 3 && "translate-x-6",
              )}
              style={{
                animation: `fadeSlideIn 0.5s ease-out ${i * 120}ms both`,
              }}
            >
              <div
                className={cn(
                  "flex items-center justify-center w-8 h-8 rounded-lg border shrink-0",
                  card.bg,
                )}
              >
                <Icon className={cn("w-4 h-4", card.color)} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">
                    {card.title}
                  </p>
                  {card.pulse && (
                    <span className="flex h-1.5 w-1.5 shrink-0">
                      <span className="animate-ping absolute inline-flex h-1.5 w-1.5 rounded-full bg-destructive opacity-75" />
                      <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-destructive" />
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                  {card.sub}
                </p>
              </div>
            </div>
          );
        })}

        {/* Live indicator */}
        <div className="flex items-center gap-2 mt-2 px-1">
          <Activity className="w-3.5 h-3.5 text-brand" />
          <span className="text-xs text-muted-foreground font-mono">
            Live monitoring · 3 projects active
          </span>
        </div>
      </div>

      {/* Bottom quote */}
      <div className="relative space-y-1">
        <p className="text-sm text-foreground font-medium">
          &quot;Caught a critical crash before 90% of our users hit it.&quot;
        </p>
        <p className="text-xs text-muted-foreground">
          — Early access developer
        </p>
      </div>

      <style>{`
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── Login form ───────────────────────────────────────────────────────────────

function LoginForm() {
  const login = useLogin();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [form, setForm] = useState({ email: "", password: "" });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login.mutate(form, {
      onSuccess: () => router.replace(from ?? "/dashboard"),
    });
  };

  return (
    <div className="w-full lg:w-1/2 flex items-center justify-center min-h-screen p-8">
      <div className="w-full max-w-sm space-y-8">
        {/* Mobile logo */}
        <div className="flex items-center gap-2 lg:hidden">
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="text-sm font-mono text-brand">PulseBoard</span>
        </div>

        {/* Header */}
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-foreground">Welcome back</h1>
          <p className="text-sm text-muted-foreground">
            Sign in to your account to continue
          </p>
        </div>

        {/* Error */}
        {login.error && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">
              Invalid email or password
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
          </div>

          <Button
            type="submit"
            disabled={login.isPending}
            className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold h-10"
          >
            {login.isPending ? "Signing in..." : "Sign in"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By signing in you agree to our{" "}
            <Link
              href="/terms-and-conditions"
              className="underline hover:text-foreground"
            >
              Terms
            </Link>{" "}
            and{" "}
            <Link
              href="/privacy-policy"
              className="underline hover:text-foreground"
            >
              Privacy Policy
            </Link>
          </p>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">
              New to PulseBoard?
            </span>
          </div>
        </div>

        <Link
          href={
            from ? `/register?from=${encodeURIComponent(from)}` : "/register"
          }
        >
          <Button variant="outline" className="w-full">
            Create an account
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LoginPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <Suspense>
        <LoginForm />
      </Suspense>
      <RightPanel />
    </div>
  );
}
