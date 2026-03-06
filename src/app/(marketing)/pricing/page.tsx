"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  Check,
  ChevronRight,
  Minus,
  Sparkles,
  Zap,
  Building2,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type BillingCycle = "monthly" | "annually";

type Platform = {
  id: string;
  name: string;
  group: string;
  available: boolean;
};

// ─── Platform Data ────────────────────────────────────────────────────────────

const PLATFORM_GROUPS = [
  {
    label: "Hybrid Mobile",
    platforms: [
      { id: "rn-cli", name: "React Native CLI", available: true },
      { id: "rn-expo", name: "React Native Expo", available: false },
      { id: "flutter", name: "Flutter", available: false },
      { id: "ionic", name: "Ionic", available: false },
      { id: "xamarin", name: "Xamarin", available: false },
    ],
  },
  {
    label: "Native Mobile",
    platforms: [
      { id: "android-view", name: "Android — View", available: false },
      {
        id: "android-compose",
        name: "Android — Jetpack Compose",
        available: false,
      },
      { id: "ios-uikit", name: "iOS — UIKit", available: false },
      { id: "ios-swiftui", name: "iOS — SwiftUI", available: false },
    ],
  },
  {
    label: "Web",
    platforms: [
      { id: "web-react", name: "React", available: false },
      { id: "web-angular", name: "Angular", available: false },
      { id: "web-vue", name: "Vue", available: false },
    ],
  },
  {
    label: "Desktop",
    platforms: [
      { id: "macos", name: "macOS", available: false },
      { id: "windows", name: "Windows", available: false },
      { id: "linux", name: "Linux", available: false },
    ],
  },
];

const ALL_PLATFORMS: Platform[] = PLATFORM_GROUPS.flatMap((g) =>
  g.platforms.map((p) => ({ ...p, group: g.label })),
);

// ─── Pricing ──────────────────────────────────────────────────────────────────

const PRO_BASE_MONTHLY = 14;
const PRO_BASE_ANNUAL = 9.99;
const PLATFORM_MONTHLY = 7;
const PLATFORM_ANNUAL = 4;

// ─── Feature Row ─────────────────────────────────────────────────────────────

const Cell = ({ value }: { value: string | boolean }) => (
  <td className="py-3 px-4 text-center">
    {typeof value === "boolean" ? (
      value ? (
        <Check className="w-4 h-4 text-brand mx-auto" />
      ) : (
        <Minus className="w-4 h-4 text-muted-foreground/30 mx-auto" />
      )
    ) : (
      <span className="text-sm text-foreground">{value}</span>
    )}
  </td>
);

function FeatureRow({
  label,
  starter,
  pro,
  enterprise,
}: {
  label: string;
  starter: string | boolean;
  pro: string | boolean;
  enterprise: string | boolean;
}) {
  return (
    <tr className="border-b border-border/50 hover:bg-muted/20 transition-colors">
      <td className="py-3 px-4 text-sm text-muted-foreground">{label}</td>
      <Cell value={starter} />
      <Cell value={pro} />
      <Cell value={enterprise} />
    </tr>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function PricingPage() {
  const [billing, setBilling] = useState<BillingCycle>("annually");
  const [selectedPlatforms, setSelectedPlatforms] = useState<Set<string>>(
    new Set(["rn-cli"]),
  );

  const togglePlatform = (id: string) => {
    // React Native CLI is always included in Pro
    if (id === "rn-cli") return;

    setSelectedPlatforms((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Pricing calculation
  const addOnCount = selectedPlatforms.size - 1; // exclude rn-cli base
  const basePrice = billing === "annually" ? PRO_BASE_ANNUAL : PRO_BASE_MONTHLY;
  const platformPrice =
    billing === "annually" ? PLATFORM_ANNUAL : PLATFORM_MONTHLY;
  const totalPrice = basePrice + addOnCount * platformPrice;
  const annualSaving =
    (PRO_BASE_MONTHLY + addOnCount * PLATFORM_MONTHLY) * 12 -
    (PRO_BASE_ANNUAL + addOnCount * PLATFORM_ANNUAL) * 12;

  return (
    <main className="pt-14">
      {/* ── Hero ──────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Background grid */}
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            "[background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)]",
            "[background-size:48px_48px] opacity-40",
          )}
        />

        <div className="relative max-w-4xl mx-auto px-6 py-24 text-center space-y-6">
          <Badge variant="outline" className="text-brand border-brand/30">
            Pricing
          </Badge>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Pay for what you monitor.{" "}
            <span className="text-brand">Nothing more.</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            Choose your platforms and build a plan that fits your stack. Start
            free, scale as you grow.
          </p>

          {/* Billing toggle */}
          <div className="inline-flex items-center gap-1 p-1 rounded-lg bg-muted border border-border">
            {(["monthly", "annually"] as BillingCycle[]).map((cycle) => (
              <button
                key={cycle}
                type="button"
                onClick={() => setBilling(cycle)}
                className={cn(
                  "flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all",
                  billing === cycle
                    ? "bg-background text-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {cycle === "annually" ? "Annual" : "Monthly"}
                {cycle === "annually" && (
                  <Badge
                    variant="outline"
                    className="text-xs text-brand border-brand/30 bg-brand/10"
                  >
                    Save up to 43%
                  </Badge>
                )}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ── Plans ─────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-border">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Starter */}
            <div
              className={cn(
                "rounded-xl border border-border p-6 space-y-6",
                "bg-card",
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Starter
                  </span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground">$0</span>
                  <span className="text-muted-foreground mb-1">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  For indie developers and small projects.
                </p>
              </div>

              <Link href="/register">
                <Button variant="outline" className="w-full">
                  Get started free
                </Button>
              </Link>

              <ul className="pt-4 space-y-3">
                {[
                  "1 project",
                  "React Native CLI",
                  "1,000 events / month",
                  "7-day data retention",
                  "Manual insights only",
                  "Community support",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="w-4 h-4 text-brand shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Pro */}
            <div
              className={cn(
                "rounded-xl border-2 border-brand p-6 space-y-6",
                "bg-card relative",
              )}
            >
              {/* Popular badge */}
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-brand text-brand-foreground border-0 shadow-sm">
                  Most Popular
                </Badge>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-brand" />
                  <span className="text-sm font-semibold text-brand uppercase tracking-wider">
                    Pro
                  </span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    ${totalPrice.toFixed(2)}
                  </span>
                  <span className="text-muted-foreground mb-1">/mo</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {addOnCount === 0
                    ? "Base plan — add platforms below"
                    : `Base + ${addOnCount} platform${addOnCount !== 1 ? "s" : ""}`}
                </p>
                {billing === "annually" && annualSaving > 0 && (
                  <p className="text-xs text-brand font-medium">
                    You save ${annualSaving.toFixed(2)}/year vs monthly
                  </p>
                )}
              </div>

              <Link href="/register">
                <Button className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold">
                  Start Pro
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </Link>

              <ul className="pt-4 space-y-3">
                {[
                  "Unlimited projects",
                  "All selected platforms",
                  "100,000 events / month",
                  "30-day data retention",
                  "Scheduled AI insights",
                  "All AI providers",
                  "Priority support",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="w-4 h-4 text-brand shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>

            {/* Enterprise */}
            <div
              className={cn(
                "rounded-xl border border-border p-6 space-y-6",
                "bg-card",
              )}
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Enterprise
                  </span>
                </div>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground">
                    Custom
                  </span>
                </div>
                <p className="text-sm text-muted-foreground">
                  For teams with scale and compliance requirements.
                </p>
              </div>

              <a href="mailto:hello@pulseboard.app">
                <Button variant="outline" className="w-full">
                  Contact us
                </Button>
              </a>

              <ul className="pt-4 space-y-3">
                {[
                  "Everything in Pro",
                  "Unlimited events",
                  "Custom data retention",
                  "Custom AI model config",
                  "SLA guarantee",
                  "Dedicated support",
                  "SSO & advanced security",
                ].map((feature) => (
                  <li
                    key={feature}
                    className="flex items-center gap-2.5 text-sm text-muted-foreground"
                  >
                    <Check className="w-4 h-4 text-brand shrink-0" />
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── Platform Configurator ──────────────────────────────────── */}
      <section className="py-16 border-b border-border bg-muted/30">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="text-brand border-brand/30">
              Build your plan
            </Badge>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Choose your platforms
            </h2>
            <p className="text-muted-foreground">
              React Native CLI is included in all Pro plans. Add more platforms
              at{" "}
              <span className="text-foreground font-medium">
                ${billing === "annually" ? PLATFORM_ANNUAL : PLATFORM_MONTHLY}
                /mo
              </span>{" "}
              each{billing === "annually" ? " (billed annually)" : ""}.
            </p>
          </div>

          {/* Platform grid */}
          <div className="space-y-6">
            {PLATFORM_GROUPS.map((group) => (
              <div key={group.label} className="space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  {group.label}
                </p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {group.platforms.map((platform) => {
                    const isSelected = selectedPlatforms.has(platform.id);
                    const isBase = platform.id === "rn-cli";
                    const isDisabled = !platform.available;

                    return (
                      <button
                        key={platform.id}
                        type="button"
                        onClick={() => togglePlatform(platform.id)}
                        disabled={isBase || isDisabled}
                        className={cn(
                          "flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm font-medium transition-all duration-150",
                          isBase &&
                            "border-brand/30 bg-brand/10 text-brand cursor-default",
                          !isBase &&
                            isSelected &&
                            !isDisabled &&
                            "border-brand bg-brand/10 text-foreground",
                          !isBase &&
                            !isSelected &&
                            !isDisabled &&
                            "border-border bg-card text-muted-foreground hover:border-brand/50 hover:text-foreground",
                          isDisabled &&
                            !isBase &&
                            "border-border bg-card text-muted-foreground/40 cursor-not-allowed",
                        )}
                      >
                        <span className="truncate">{platform.name}</span>
                        {isBase && (
                          <Badge
                            variant="outline"
                            className="text-xs text-brand border-brand/30 ml-2 shrink-0"
                          >
                            Included
                          </Badge>
                        )}
                        {!isBase && isSelected && !isDisabled && (
                          <Check className="w-3.5 h-3.5 text-brand ml-2 shrink-0" />
                        )}
                        {!isBase && isDisabled && (
                          <Badge
                            variant="outline"
                            className="text-xs text-muted-foreground/40 border-border ml-2 shrink-0"
                          >
                            Soon
                          </Badge>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* Price summary */}
          <div
            className={cn(
              "rounded-xl border border-brand/20 bg-brand/5 p-6",
              "flex flex-col md:flex-row items-center justify-between gap-4",
            )}
          >
            <div className="space-y-1 text-center md:text-left">
              <p className="text-sm text-muted-foreground">
                Your estimated Pro plan
              </p>
              <div className="flex items-end gap-1.5">
                <span className="text-3xl font-bold text-foreground">
                  ${totalPrice.toFixed(2)}
                </span>
                <span className="text-muted-foreground mb-0.5">/mo</span>
                {billing === "annually" && (
                  <span className="text-sm text-muted-foreground mb-0.5">
                    · billed ${(totalPrice * 12).toFixed(2)}/yr
                  </span>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Base ${basePrice.toFixed(2)}/mo</span>
                {addOnCount > 0 && (
                  <span>
                    + {addOnCount} platform{addOnCount !== 1 ? "s" : ""} × $
                    {platformPrice}/mo
                  </span>
                )}
                {billing === "annually" && annualSaving > 0 && (
                  <span className="text-brand font-medium">
                    Saving ${annualSaving.toFixed(2)}/yr
                  </span>
                )}
              </div>
            </div>

            <Link href="/register">
              <Button className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold shrink-0">
                Get started
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ── Comparison Table ───────────────────────────────────────── */}
      <section className="py-16 border-b border-border">
        <div className="max-w-4xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Compare plans
            </h2>
            <p className="text-muted-foreground">
              Everything you need to make the right choice.
            </p>
          </div>

          <div className="rounded-xl border border-border overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/50">
                  <th className="py-3 px-4 text-left text-sm font-semibold text-foreground w-1/2">
                    Feature
                  </th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-muted-foreground">
                    Starter
                  </th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-brand">
                    Pro
                  </th>
                  <th className="py-3 px-4 text-center text-sm font-semibold text-muted-foreground">
                    Enterprise
                  </th>
                </tr>
              </thead>
              <tbody>
                <FeatureRow
                  label="Projects"
                  starter="1"
                  pro="Unlimited"
                  enterprise="Unlimited"
                />
                <FeatureRow
                  label="Events / month"
                  starter="1,000"
                  pro="100,000"
                  enterprise="Unlimited"
                />
                <FeatureRow
                  label="Data retention"
                  starter="7 days"
                  pro="30 days"
                  enterprise="Custom"
                />
                <FeatureRow
                  label="Platforms"
                  starter="RN CLI only"
                  pro="Your choice"
                  enterprise="All"
                />
                <FeatureRow
                  label="Crash analytics"
                  starter={true}
                  pro={true}
                  enterprise={true}
                />
                <FeatureRow
                  label="Real-time events"
                  starter={true}
                  pro={true}
                  enterprise={true}
                />
                <FeatureRow
                  label="AI insights"
                  starter={false}
                  pro={true}
                  enterprise={true}
                />
                <FeatureRow
                  label="Scheduled insights"
                  starter={false}
                  pro={true}
                  enterprise={true}
                />
                <FeatureRow
                  label="All AI providers"
                  starter={false}
                  pro={true}
                  enterprise={true}
                />
                <FeatureRow
                  label="Priority support"
                  starter={false}
                  pro={true}
                  enterprise={true}
                />
                <FeatureRow
                  label="SLA guarantee"
                  starter={false}
                  pro={false}
                  enterprise={true}
                />
                <FeatureRow
                  label="SSO"
                  starter={false}
                  pro={false}
                  enterprise={true}
                />
                <FeatureRow
                  label="Custom AI config"
                  starter={false}
                  pro={false}
                  enterprise={true}
                />
                <FeatureRow
                  label="Dedicated support"
                  starter={false}
                  pro={false}
                  enterprise={true}
                />
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ── FAQ ───────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <div className="text-center space-y-3">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-4">
            {[
              {
                q: "What counts as an event?",
                a: "An event is any data point sent from your SDK — a crash, session start/end, screen view, API call, or custom event. Each SDK call that sends data to PulseBoard counts as one event.",
              },
              {
                q: "What is the AI insights feature?",
                a: "AI insights analyses your crash and performance data daily and surfaces actionable recommendations. You bring your own API key from Anthropic, OpenAI, Moonshot or Google — PulseBoard never charges for AI usage.",
              },
              {
                q: "Can I change my plan or platforms later?",
                a: "Yes — you can add or remove platforms at any time. Changes take effect at the start of your next billing cycle.",
              },
              {
                q: "What happens if I exceed my event limit?",
                a: "We'll notify you when you reach 80% of your limit. Events above the limit are queued and processed once your cycle resets, or you can upgrade to avoid any interruption.",
              },
              {
                q: "Is there a free trial for Pro?",
                a: "The Starter plan is free forever and includes React Native CLI. Pro features are coming soon — join the waitlist to be notified when Pro launches.",
              },
            ].map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl border border-border bg-card p-5 space-y-2"
              >
                <p className="text-sm font-semibold text-foreground">{q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────── */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl font-bold text-foreground tracking-tight">
            Start free. Upgrade when you&apos;re ready.
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            No credit card required. The Starter plan is free forever.
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
            <a href="mailto:hello@pulseboard.app">
              <Button size="lg" variant="outline">
                Talk to us
              </Button>
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
