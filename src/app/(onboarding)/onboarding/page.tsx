"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/auth.store";
import { cn } from "@/lib/utils";
import { Activity, Brain, ChevronRight, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OnboardingWelcomePage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      {/* Background grid */}
      <div
        className={cn(
          "fixed inset-0 pointer-events-none",
          "[background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)]",
          "[background-size:48px_48px] opacity-30",
        )}
      />

      <div className="relative w-full max-w-lg space-y-10 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="text-sm font-mono font-semibold text-foreground">
            PulseBoard
          </span>
        </div>

        {/* Heading */}
        <div className="space-y-3">
          <div className="flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
              <Sparkles className="w-8 h-8 text-brand" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-foreground tracking-tight">
            Welcome, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground leading-relaxed">
            Let&apos;s get your first project set up. It takes about 3 minutes.
          </p>
        </div>

        {/* What you'll get */}
        <div className="grid grid-cols-1 gap-3 text-left">
          {[
            {
              icon: Activity,
              title: "Real-time crash monitoring",
              desc: "See every crash the moment it happens.",
            },
            {
              icon: Brain,
              title: "AI-powered insights",
              desc: "Daily analysis with your own AI provider.",
            },
            {
              icon: Zap,
              title: "Live event streaming",
              desc: "Watch your app run in real time.",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="flex items-start gap-3 p-4 rounded-xl border border-border bg-card"
              >
                <div className="w-8 h-8 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    {item.title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step 1 of 4</span>
            <span>25%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/4 bg-brand rounded-full transition-all duration-500" />
          </div>
        </div>

        <Button
          onClick={() => router.push("/onboarding/project")}
          className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold h-11"
        >
          Get started
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
