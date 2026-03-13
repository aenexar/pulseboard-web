"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useRegister } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  BarChart2,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

// ─── Animated left panel ──────────────────────────────────────────────────────

function LeftPanel() {
  const features = [
    {
      icon: BarChart2,
      color: "text-brand",
      title: "Real-time crash analytics",
      desc: "Know when your app crashes before your users report it.",
    },
    {
      icon: Lightbulb,
      color: "text-yellow-500",
      title: "AI-powered insights",
      desc: "Bring your own API key. Get actionable recommendations daily.",
    },
    {
      icon: Zap,
      color: "text-blue-500",
      title: "Live event feed",
      desc: "Stream events from your app in real time. Zero latency.",
    },
    {
      icon: CheckCircle2,
      color: "text-emerald-500",
      title: "Zero vendor lock-in",
      desc: "Open API, multiple SDK options, self-hostable.",
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

      {/* Radial gradient */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,hsl(var(--brand)/0.08),transparent_60%)] pointer-events-none" />

      {/* Logo */}
      <div className="relative flex items-center gap-2.5">
        <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        <span className="text-sm font-mono font-semibold text-foreground">
          PulseBoard
        </span>
      </div>

      {/* Feature list */}
      <div className="relative flex-1 flex flex-col justify-center gap-6 py-12">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-brand" />
            <span className="text-xs font-semibold text-brand uppercase tracking-wider">
              Everything you need
            </span>
          </div>
          <h2 className="text-2xl font-bold text-foreground leading-snug">
            Monitor smarter.
            <br />
            Ship faster.
          </h2>
        </div>

        <div className="space-y-4">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="flex items-start gap-3"
                style={{
                  animation: `fadeSlideIn 0.5s ease-out ${i * 100}ms both`,
                }}
              >
                <div className="w-8 h-8 rounded-lg bg-muted border border-border flex items-center justify-center shrink-0 mt-0.5">
                  <Icon className={cn("w-4 h-4", f.color)} />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {f.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                    {f.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Stats row */}
        <div className="flex items-center gap-6 pt-2">
          {[
            { label: "Events tracked", value: "10M+" },
            { label: "Projects", value: "500+" },
            { label: "Uptime", value: "99.9%" },
          ].map((stat) => (
            <div key={stat.label}>
              <p className="text-lg font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom */}
      <div className="relative space-y-1">
        <p className="text-sm text-foreground font-medium">
          &quot;Set up in 5 minutes, insights in an hour.&quot;
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

// ─── Register form ────────────────────────────────────────────────────────────

function RegisterForm() {
  const register = useRegister();
  const router = useRouter();
  const searchParams = useSearchParams();
  const from = searchParams.get("from");

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [newsletter, setNewsletter] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(form, {
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
          <h1 className="text-2xl font-bold text-foreground">
            Create an account
          </h1>
          <p className="text-sm text-muted-foreground">
            Start monitoring your apps in minutes. Free forever.
          </p>
        </div>

        {/* Error */}
        {register.error && (
          <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
            <p className="text-sm text-destructive">
              Something went wrong. Please try again.
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">Full name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              autoFocus
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              minLength={8}
              required
            />
          </div>

          {/* Newsletter checkbox */}
          <div className="flex items-start gap-3 pt-1">
            <Checkbox
              id="newsletter"
              checked={newsletter}
              onCheckedChange={(v: boolean) => setNewsletter(v === true)}
              className="mt-0.5"
            />
            <Label
              htmlFor="newsletter"
              className="text-sm text-muted-foreground font-normal leading-relaxed cursor-pointer"
            >
              Send me product updates, new SDK announcements, and tips. No spam
              — unsubscribe anytime.
            </Label>
          </div>

          <Button
            type="submit"
            disabled={register.isPending}
            className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold h-10"
          >
            {register.isPending ? "Creating account..." : "Create account"}
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            By creating an account you agree to our{" "}
            <Link href="/terms" className="underline hover:text-foreground">
              Terms
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="underline hover:text-foreground">
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
              Already have an account?
            </span>
          </div>
        </div>

        <Link
          href={from ? `/login?from=${encodeURIComponent(from)}` : "/login"}
        >
          <Button variant="outline" className="w-full">
            Sign in
          </Button>
        </Link>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function RegisterPage() {
  return (
    <div className="flex min-h-screen bg-background">
      <LeftPanel />
      <Suspense>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
