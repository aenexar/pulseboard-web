"use client";

import {
  useCompleteOnboarding,
  useDismissOnboarding,
  useProjects,
} from "@/hooks";
import { useOrganisations } from "@/hooks/organisations/useOrganisations";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import {
  Brain,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Circle,
  FolderKanban,
  Terminal,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

type ChecklistItem = {
  id: string;
  label: string;
  icon: React.ElementType;
  done: boolean;
  href?: string;
};

export function OnboardingChecklist() {
  const user = useAuthStore((s) => s.user);
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const { data: orgs } = useOrganisations();
  const firstSlug = slug ?? orgs?.[0]?.slug ?? "";
  const { data: projects } = useProjects(firstSlug);

  const dismiss = useDismissOnboarding();
  const complete = useCompleteOnboarding();

  const [collapsed, setCollapsed] = useState(false);

  const hasProject = (projects?.length ?? 0) > 0;
  const firstProject = projects?.[0];
  const hasAiConfig = false; // will be true once we check aiConfig — simplified for now

  const items: ChecklistItem[] = [
    {
      id: "project",
      label: "Create your first project",
      icon: FolderKanban,
      done: hasProject,
      href: `/${firstSlug}/projects`,
    },
    {
      id: "sdk",
      label: "Install the SDK",
      icon: Terminal,
      done: false, // no way to verify — trust the user
      href: firstProject
        ? `/${firstSlug}/projects/${firstProject.id}`
        : `/${firstSlug}/projects`,
    },
    {
      id: "ai",
      label: "Configure AI insights",
      icon: Brain,
      done: hasAiConfig,
      href: firstProject
        ? `/${firstSlug}/projects/${firstProject.id}/settings`
        : `/${firstSlug}/projects`,
    },
    {
      id: "member",
      label: "Invite a team member",
      icon: Users,
      done: (orgs?.[0]?.members?.length ?? 0) > 1,
      href: `/${firstSlug}/members`,
    },
  ];

  const completedCount = items.filter((i) => i.done).length;
  const allDone = completedCount === items.length;
  const progress = Math.round((completedCount / items.length) * 100);

  // Auto-complete when all items are done
  useEffect(() => {
    if (allDone) {
      complete.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allDone, complete.mutate]);

  // Don't show if onboarding is completed or dismissed
  if (!user) return null;
  if (user.onboardingCompletedAt) return null;
  if (user.onboardingDismissedAt) return null;

  return (
    <div
      className={cn(
        "fixed bottom-6 right-6 z-50",
        "w-80 rounded-2xl border border-border bg-card shadow-xl",
        "transition-all duration-300",
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div className="flex items-center gap-2.5">
          <div className="relative w-8 h-8">
            <svg className="w-8 h-8 -rotate-90" viewBox="0 0 32 32">
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="3"
              />
              <circle
                cx="16"
                cy="16"
                r="12"
                fill="none"
                stroke="hsl(var(--brand))"
                strokeWidth="3"
                strokeDasharray={`${progress * 0.75} 75`}
                strokeLinecap="round"
              />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-foreground">
              {completedCount}
            </span>
          </div>
          <div>
            <p className="text-sm font-semibold text-foreground">
              Getting started
            </p>
            <p className="text-xs text-muted-foreground">
              {completedCount} of {items.length} completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            {collapsed ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </button>
          <button
            type="button"
            title="close button"
            onClick={() => dismiss.mutate()}
            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Items */}
      {!collapsed && (
        <div className="p-3 space-y-1">
          {items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.id}
                href={item.href ?? "#"}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-xl transition-colors",
                  item.done
                    ? "opacity-60 cursor-default pointer-events-none"
                    : "hover:bg-accent cursor-pointer",
                )}
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
                <p
                  className={cn(
                    "text-sm flex-1",
                    item.done
                      ? "text-muted-foreground line-through"
                      : "text-foreground font-medium",
                  )}
                >
                  {item.label}
                </p>
                {item.done ? (
                  <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-muted-foreground/30 shrink-0" />
                )}
              </Link>
            );
          })}

          {/* Progress bar */}
          <div className="pt-2 px-1 space-y-1.5">
            <div className="h-1.5 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-brand rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex items-center justify-between">
              <p className="text-xs text-muted-foreground">
                {allDone ? "All done! 🎉" : `${progress}% complete`}
              </p>
              <button
                type="button"
                onClick={() => dismiss.mutate()}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
