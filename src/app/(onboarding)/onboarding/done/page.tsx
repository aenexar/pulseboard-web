"use client";

import { Button } from "@/components/ui/button";
import { useCompleteOnboarding, useProducts } from "@/hooks";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboarding.store";
import {
  Activity,
  Brain,
  CheckCircle2,
  ChevronRight,
  FolderKanban,
  Sparkles,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function OnboardingDonePage() {
  const router = useRouter();
  const { slug, projectId, reset } = useOnboardingStore();
  const completeOnboarding = useCompleteOnboarding();
  const { data: products } = useProducts(slug ?? "");
  const productSlug = products?.[0]?.slug ?? "";

  useEffect(() => {
    completeOnboarding.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [completeOnboarding.mutate]);

  const handleGoToDashboard = () => {
    reset();
    if (slug && projectId && productSlug) {
      router.replace(`/${slug}/products/${productSlug}/projects/${projectId}`);
    } else if (slug) {
      router.replace(`/${slug}`);
    } else {
      router.replace("/dashboard");
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div
        className={cn(
          "fixed inset-0 pointer-events-none",
          "[background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)]",
          "[background-size:48px_48px] opacity-30",
        )}
      />

      {/* Confetti-style background glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-brand/10 blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-md space-y-8 text-center">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="text-sm font-mono font-semibold text-foreground">
            PulseBoard
          </span>
        </div>

        {/* Icon */}
        <div className="flex flex-col items-center gap-4">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
              <Sparkles className="w-10 h-10 text-brand" />
            </div>
            <div className="absolute -top-2 -right-2 w-7 h-7 rounded-full bg-brand flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-white" />
            </div>
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-bold text-foreground">
              You&apos;re all set!
            </h1>
            <p className="text-sm text-muted-foreground">
              Your project is ready. Start sending events to see them appear in
              your dashboard in real time.
            </p>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-3 text-left">
          {[
            {
              icon: FolderKanban,
              label: "Project created",
              done: !!projectId,
            },
            {
              icon: Activity,
              label: "SDK ready to install",
              done: true,
            },
            {
              icon: Brain,
              label: "AI insights",
              done: false,
              note: "Configure anytime in project settings",
            },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.label}
                className="flex items-center gap-3 p-3 rounded-xl border border-border bg-card"
              >
                <div
                  className={cn(
                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0",
                    item.done ? "bg-brand/10" : "bg-muted",
                  )}
                >
                  <Icon
                    className={cn(
                      "w-4 h-4",
                      item.done ? "text-brand" : "text-muted-foreground",
                    )}
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {item.label}
                  </p>
                  {item.note && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {item.note}
                    </p>
                  )}
                </div>
                {item.done && (
                  <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                )}
              </div>
            );
          })}
        </div>

        <Button
          onClick={handleGoToDashboard}
          className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold h-11"
        >
          Go to my dashboard
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
