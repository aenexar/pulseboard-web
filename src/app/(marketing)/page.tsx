"use client";

import { NewsletterSection } from "@/components/marketing/newsletters-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  BarChart2,
  Brain,
  ChevronRight,
  Code2,
  Github,
  Globe,
  MonitorSmartphone,
  Package,
  Shield,
  Sparkles,
  Terminal,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

// ─── Fake event stream ────────────────────────────────────────────────────────

const FAKE_EVENTS = [
  {
    type: "crash",
    name: "NullPointerException",
    meta: "v2.1.4 · Samsung Galaxy A52",
  },
  { type: "session", name: "Session started", meta: "iPhone 15 · iOS 17.2" },
  { type: "api_call", name: "POST /api/checkout", meta: "8,420ms · 503" },
  { type: "screen_view", name: "CheckoutScreen", meta: "load: 1,810ms" },
  { type: "crash", name: "NetworkError", meta: "v2.1.3 · Pixel 7" },
  { type: "session", name: "Session ended", meta: "duration: 4m 32s" },
  { type: "api_call", name: "GET /api/products", meta: "142ms · 200" },
  { type: "screen_view", name: "HomeScreen", meta: "load: 320ms" },
  { type: "crash", name: "IllegalStateException", meta: "v2.1.4 · OnePlus 11" },
  { type: "api_call", name: "POST /api/auth/refresh", meta: "89ms · 200" },
];

const EVENT_BADGES: Record<string, string> = {
  crash: "bg-destructive/10 text-destructive border-destructive/20",
  session: "bg-brand/10 text-brand border-brand/20",
  api_call: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  screen_view:
    "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
};

function EventTicker() {
  const [events, setEvents] = useState<typeof FAKE_EVENTS>([]);
  const indexRef = useRef(0);

  useEffect(() => {
    const push = () => {
      const event = FAKE_EVENTS[indexRef.current % FAKE_EVENTS.length];
      indexRef.current++;
      setEvents((prev) => [event, ...prev].slice(0, 6));
    };

    push();
    const interval = setInterval(push, 1800);
    return () => clearInterval(interval);
  }, []);

  return (
    <div
      className={cn(
        "rounded-xl border border-border overflow-hidden",
        "bg-card shadow-2xl",
      )}
    >
      {/* Terminal header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/50">
        <div className="flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-destructive/60" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <div className="w-3 h-3 rounded-full bg-brand/60" />
        </div>
        <div className="flex items-center gap-2 ml-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">
            live events — my-app
          </span>
        </div>
      </div>

      {/* Events */}
      <div className="p-4 space-y-2 min-h-[280px]">
        {events.map((event, i) => (
          <div
            key={`${event.name}-${i}`}
            className={cn(
              "flex items-center gap-3 p-2.5 rounded-lg",
              "bg-background/50 border border-border/50",
              "animate-in fade-in slide-in-from-top-2 duration-300",
            )}
          >
            <Badge
              variant="outline"
              className={cn(
                "text-xs font-mono shrink-0",
                EVENT_BADGES[event.type],
              )}
            >
              {event.type}
            </Badge>
            <span className="text-sm font-medium text-foreground truncate flex-1">
              {event.name}
            </span>
            <span className="text-xs text-muted-foreground font-mono shrink-0 hidden sm:block">
              {event.meta}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Feature Card ─────────────────────────────────────────────────────────────

function FeatureCard({
  icon: Icon,
  title,
  description,
  accent,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  accent: string;
}) {
  return (
    <div
      className={cn(
        "group p-6 rounded-xl border border-border",
        "bg-card hover:border-brand/30 transition-colors duration-300",
      )}
    >
      <div
        className={cn(
          "flex items-center justify-center w-10 h-10 rounded-lg mb-4",
          accent,
        )}
      >
        <Icon className="w-5 h-5" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground leading-relaxed">
        {description}
      </p>
    </div>
  );
}

// ─── Step ─────────────────────────────────────────────────────────────────────

function Step({
  number,
  title,
  description,
  code,
}: {
  number: string;
  title: string;
  description: string;
  code?: string;
}) {
  return (
    <div className="flex gap-6">
      <div className="flex flex-col items-center">
        <div
          className={cn(
            "flex items-center justify-center w-8 h-8 rounded-full shrink-0",
            "bg-brand/10 border border-brand/30 text-brand text-sm font-bold font-mono",
          )}
        >
          {number}
        </div>
        <div className="w-px flex-1 bg-border mt-3" />
      </div>
      <div className="pb-10">
        <h3 className="text-base font-semibold text-foreground mb-1">
          {title}
        </h3>
        <p className="text-sm text-muted-foreground leading-relaxed mb-3">
          {description}
        </p>
        {code && (
          <pre
            className={cn(
              "text-xs font-mono p-3 rounded-lg",
              "bg-muted border border-border text-foreground",
            )}
          >
            {code}
          </pre>
        )}
      </div>
    </div>
  );
}

// ─── AI Provider Badge ────────────────────────────────────────────────────────

function ProviderBadge({ name, model }: { name: string; model: string }) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1 px-5 py-4 rounded-xl",
        "border border-border bg-card",
        "hover:border-brand/30 transition-colors duration-200",
      )}
    >
      <span className="text-sm font-semibold text-foreground">{name}</span>
      <span className="text-xs text-muted-foreground font-mono">{model}</span>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function HomePage() {
  return (
    <main className="pt-14">
      {/* ── Hero ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background grid */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            "[background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)]",
            "[background-size:48px_48px]",
            "opacity-40",
          )}
        />

        {/* Radial glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-brand/10 blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left — Copy */}
            <div className="space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-brand/30 bg-brand/10">
                <Sparkles className="w-3.5 h-3.5 text-brand" />
                <span className="text-xs font-medium text-brand">
                  Now with AI-powered insights
                </span>
              </div>

              <div className="space-y-4">
                <h1 className="text-5xl font-bold text-foreground leading-[1.1] tracking-tight">
                  Observability for{" "}
                  <span className="text-brand">mobile apps</span> that actually
                  matters
                </h1>
                <p className="text-lg text-muted-foreground leading-relaxed max-w-lg">
                  Crash analytics, real-time event streaming and AI-powered
                  insights for React Native developers. Know what&apos;s
                  breaking before your users do.
                </p>
              </div>

              <div className="flex items-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
                  >
                    Start for free
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link
                  href="https://github.com/aenexar/pulseboard-react-native"
                  target="_blank"
                >
                  <Button size="lg" variant="outline" className="gap-2">
                    <Github className="w-4 h-4" />
                    View on GitHub
                  </Button>
                </Link>
              </div>

              <div className="flex items-center gap-6 pt-2">
                {[
                  { icon: Package, label: "npm install" },
                  { icon: Shield, label: "Encrypted keys" },
                  { icon: Zap, label: "Real-time" },
                ].map(({ icon: Icon, label }) => (
                  <div
                    key={label}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Icon className="w-4 h-4 text-brand" />
                    {label}
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Live ticker */}
            <div className="relative">
              <EventTicker />
              {/* Fade bottom */}
              <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-background to-transparent rounded-b-xl pointer-events-none" />
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ────────────────────────────────────────────────── */}
      <section id="features" className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16 space-y-3">
            <Badge variant="outline" className="text-brand border-brand/30">
              Features
            </Badge>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Everything you need to ship with confidence
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Built specifically for mobile developers who want actionable
              observability without the enterprise complexity.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <FeatureCard
              icon={AlertTriangle}
              title="Crash Analytics"
              description="Automatic crash grouping by fingerprint. Track occurrences, affected users, first and last seen across every app version and device."
              accent="bg-destructive/10 text-destructive"
            />
            <FeatureCard
              icon={Brain}
              title="AI-Powered Insights"
              description="Bring your own AI provider — Anthropic, OpenAI, Moonshot or Google. Get daily actionable insights generated from your real crash and performance data."
              accent="bg-brand/10 text-brand"
            />
            <FeatureCard
              icon={Activity}
              title="Real-time Event Feed"
              description="Live event streaming via WebSocket. See crashes, sessions, API calls and screen views appear in your dashboard the moment they happen."
              accent="bg-blue-500/10 text-blue-500"
            />
            <FeatureCard
              icon={BarChart2}
              title="Performance Monitoring"
              description="Track API response times and screen load times. Identify slow endpoints and sluggish screens before they impact user retention."
              accent="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
            />
            <FeatureCard
              icon={MonitorSmartphone}
              title="Device & Version Breakdown"
              description="See crash distribution across device models and app versions. Pinpoint whether a crash is device-specific or introduced in a specific release."
              accent="bg-brand/10 text-brand"
            />
            <FeatureCard
              icon={Code2}
              title="Hybrid Mobile SDKs"
              description="First-class support for React Native CLI and Expo. Flutter, Ionic and Xamarin coming soon — one unified API across all hybrid frameworks."
              accent="bg-destructive/10 text-destructive"
            />
            <FeatureCard
              icon={MonitorSmartphone}
              title="Native Mobile SDKs"
              description="Dedicated SDKs for iOS (UIKit & SwiftUI) and Android (View & Jetpack Compose). Deep OS integration for accurate crash context and device signals."
              accent="bg-blue-500/10 text-blue-500"
            />
            <FeatureCard
              icon={Globe}
              title="Web SDKs"
              description="Monitor your web apps with dedicated SDKs for React, Angular and Vue. Same unified dashboard — one place for all your platform observability."
              accent="bg-yellow-500/10 text-yellow-600 dark:text-yellow-400"
            />
            <FeatureCard
              icon={Terminal}
              title="Console SDKs"
              description="Monitor desktop applications on Windows, macOS and Linux. Track crashes, performance and user behaviour across all major desktop platforms."
              accent="bg-brand/10 text-brand"
            />
          </div>
        </div>
      </section>

      {/* ── How It Works ────────────────────────────────────────────── */}
      <section
        id="how-it-works"
        className="py-24 border-t border-border bg-muted/30"
      >
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
            <div className="space-y-4">
              <Badge variant="outline" className="text-brand border-brand/30">
                How it works
              </Badge>
              <h2 className="text-3xl font-bold text-foreground tracking-tight">
                From install to insights in minutes
              </h2>
              <p className="text-muted-foreground leading-relaxed">
                PulseBoard is designed to get out of your way. Install the SDK,
                initialise with your project key, and start seeing data
                immediately — no complex configuration required.
              </p>
            </div>

            <div>
              <Step
                number="1"
                title="Install the SDK"
                description="Add the PulseBoard React Native SDK to your project via npm. iOS and Android native modules are linked automatically."
                code="npm install @pulseboard/react-native"
              />
              <Step
                number="2"
                title="Initialise in your app entry point"
                description="Call PulseBoard.init() with your project API key and environment. App version, build number and device context are read automatically from native modules."
                code={`PulseBoard.init({
  apiKey: 'project_api_key',
  environment: 'production',
})`}
              />
              <Step
                number="3"
                title="Configure your AI provider"
                description="Add your own API key for Anthropic, OpenAI, Moonshot or Google. Set your preferred schedule — or trigger insights manually."
              />
              <Step
                number="4"
                title="Ship with confidence"
                description="Monitor crashes, performance and user behaviour in real time. Let AI surface the issues that matter most."
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── AI Providers ────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border">
        <div className="max-w-6xl mx-auto px-6 text-center space-y-10">
          <div className="space-y-3">
            <Badge variant="outline" className="text-brand border-brand/30">
              Bring your own AI
            </Badge>
            <h2 className="text-3xl font-bold text-foreground tracking-tight">
              Your API key. Your cost. Your control.
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              PulseBoard never charges for AI usage. Connect your preferred
              provider and pay them directly — keys are encrypted at rest using
              AES-256-GCM.
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            <ProviderBadge name="Anthropic" model="Claude Sonnet / Haiku" />
            <ProviderBadge name="OpenAI" model="GPT-4o / GPT-4o Mini" />
            <ProviderBadge name="Google" model="Gemini 1.5 Pro / Flash" />
            <ProviderBadge name="Moonshot (Kimi)" model="v1 8K / 32K" />
          </div>
        </div>
      </section>

      {/* ── Newsletter ──────────────────────────────────────────────── */}
      <NewsletterSection />

      {/* ── CTA ─────────────────────────────────────────────────────── */}
      <section className="py-24 border-t border-border bg-muted/30">
        <div className="max-w-6xl mx-auto px-6">
          <div
            className={cn(
              "relative overflow-hidden rounded-2xl p-12 text-center",
              "bg-card border border-border",
            )}
          >
            {/* Background glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] bg-brand/10 blur-3xl pointer-events-none" />

            <div className="relative space-y-6">
              <div className="flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
                <span className="text-sm font-mono text-muted-foreground">
                  built by Aenexar
                </span>
              </div>
              <h2 className="text-4xl font-bold text-foreground tracking-tight">
                Ready to see what&apos;s breaking?
              </h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Start monitoring your React Native app today. No credit card
                required.
              </p>
              <div className="flex items-center justify-center gap-4">
                <Link href="/register">
                  <Button
                    size="lg"
                    className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
                  >
                    Get started for free
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ──────────────────────────────────────────────────── */}
      <footer className="border-t border-border py-10">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-brand" />
            <span className="text-sm font-mono text-muted-foreground">
              PulseBoard by Aenexar
            </span>
          </div>

          <div className="flex items-center gap-6">
            <Link
              href="https://github.com/aenexar/pulseboard-react-native"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              SDK
            </Link>
            <Link
              href="https://www.npmjs.com/package/@pulseboard/react-native"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              npm
            </Link>
            <Link
              href="https://github.com/aenexar"
              target="_blank"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              GitHub
            </Link>
            <Link
              href="/terms-and-conditions"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy-policy"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/support"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Support
            </Link>
          </div>

          <p className="text-sm text-muted-foreground">
            © 2026 Aenexar. All rights reserved.
          </p>
        </div>
      </footer>
    </main>
  );
}
