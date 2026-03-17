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
import { useNewsletterSubscribe } from "@/hooks/useNewsletter";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

// GitHub SVG icon
function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

// Google SVG icon
function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

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
  const subscribe = useNewsletterSubscribe();

  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [newsletter, setNewsletter] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    register.mutate(form, {
      onSuccess: () => {
        if (newsletter) {
          subscribe.mutate({ email: form.email, source: "register" });
        }
        router.replace("/onboarding");
      },
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

        {/* OAuth buttons */}
        <div className="flex flex-col gap-4">
          <a href={`${API_URL}/auth/github`}>
            <Button variant="outline" className="w-full gap-3" type="button">
              <GitHubIcon className="w-4 h-4" />
              Sign up with GitHub
            </Button>
          </a>
          <a href={`${API_URL}/auth/google`}>
            <Button variant="outline" className="w-full gap-3" type="button">
              <GoogleIcon className="w-4 h-4" />
              Sign up with Google
            </Button>
          </a>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-background px-2 text-muted-foreground">
              or register with email
            </span>
          </div>
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

          <div className="flex gap-3">
            <Link href="/" className="flex-1">
              <Button type="button" variant="outline" className="w-full">
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              disabled={register.isPending}
              className="flex-1 bg-brand hover:bg-brand/90 text-brand-foreground font-semibold h-10"
            >
              {register.isPending ? "Creating account..." : "Create account"}
            </Button>
          </div>

          <p className="text-center text-xs text-muted-foreground">
            By creating an account you agree to our{" "}
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
