"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useInsights,
  useTriggerInsights,
  useMarkInsightRead,
  useAiConfig,
} from "@/hooks";
import { Insight, InsightSeverity } from "@/types";
import {
  AlertTriangle,
  AlertCircle,
  Info,
  Sparkles,
  RefreshCw,
  CheckCheck,
  Clock,
  Repeat2,
  Brain,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { useParams } from "next/navigation";
import React from "react";

const COOLDOWN_MS = 60 * 60 * 1000;

function getCooldownState(lastTriggeredAt: string | null) {
  if (!lastTriggeredAt) return { onCooldown: false, minutesLeft: 0 };
  const elapsed = Date.now() - new Date(lastTriggeredAt).getTime();
  const remaining = COOLDOWN_MS - elapsed;
  if (remaining <= 0) return { onCooldown: false, minutesLeft: 0 };
  return { onCooldown: true, minutesLeft: Math.ceil(remaining / 1000 / 60) };
}

const SEVERITY_CONFIG: Record<
  InsightSeverity,
  {
    icon: React.ElementType;
    label: string;
    className: string;
    dotClass: string;
  }
> = {
  critical: {
    icon: AlertCircle,
    label: "Critical",
    className: "text-destructive border-destructive/30 bg-destructive/10",
    dotClass: "bg-destructive",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    className: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
    dotClass: "bg-yellow-500",
  },
  info: {
    icon: Info,
    label: "Info",
    className: "text-blue-500 border-blue-500/30 bg-blue-500/10",
    dotClass: "bg-blue-500",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  crash: "Crash",
  performance: "Performance",
  network: "Network",
  release: "Release",
  user_behaviour: "User Behaviour",
};

function groupByDay(insights: Insight[]): Record<string, Insight[]> {
  return insights.reduce<Record<string, Insight[]>>((acc, insight) => {
    const day = new Date(insight.generatedAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[day]) acc[day] = [];
    acc[day].push(insight);
    return acc;
  }, {});
}

function InsightCard({
  insight,
  onMarkRead,
}: {
  insight: Insight;
  onMarkRead: (id: string) => void;
}) {
  const severity = SEVERITY_CONFIG[insight.severity];
  const Icon = severity.icon;
  const firstSeen = new Date(insight.firstSeenAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const isRecurring = insight.occurrences > 1;

  return (
    <Card
      className={cn(
        "transition-opacity duration-200",
        insight.isRead && "opacity-60",
      )}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-md shrink-0",
              severity.className,
            )}
          >
            <Icon className="w-4 h-4" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span
                  className={cn(
                    "text-sm font-semibold",
                    insight.isRead
                      ? "text-muted-foreground"
                      : "text-foreground",
                  )}
                >
                  {insight.title}
                </span>
                <Badge variant="outline" className="text-xs">
                  {CATEGORY_LABELS[insight.category] ?? insight.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("text-xs", severity.className)}
                >
                  {severity.label}
                </Badge>
              </div>
              {insight.isRead ? (
                <CheckCheck className="w-4 h-4 text-brand shrink-0" />
              ) : (
                <button
                  type="button"
                  onClick={() => onMarkRead(insight.id)}
                  className="text-muted-foreground hover:text-brand shrink-0 transition-colors"
                  aria-label="Mark as read"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1.5">
              {insight.description}
            </p>
            <div className="flex items-center gap-4 mt-3">
              {isRecurring ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Repeat2 className="w-3 h-3" />
                  Recurring for {insight.occurrences} day
                  {insight.occurrences !== 1 ? "s" : ""} · First seen{" "}
                  {firstSeen}
                </div>
              ) : (
                <div className="flex items-center gap-1.5 text-xs text-brand">
                  <Sparkles className="w-3 h-3" />
                  New today
                </div>
              )}
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Clock className="w-3 h-3" />
                {new Date(insight.generatedAt).toLocaleTimeString("en-US", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function InsightsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = params?.id as string;

  const { data: insights, isLoading: insightsLoading } = useInsights(slug, id);
  const { data: aiConfig, isLoading: configLoading } = useAiConfig(slug, id);
  const triggerInsights = useTriggerInsights(slug, id);
  const markRead = useMarkInsightRead(slug, id);

  const isLoading = insightsLoading || configLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-12" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  if (!aiConfig) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insights</h1>
          <p className="text-muted-foreground mt-1">
            AI-powered analysis of your app&apos;s health
          </p>
        </div>
        <div
          className={cn(
            "flex flex-col items-center justify-center py-24 gap-4 rounded-lg",
            "border border-dashed border-border",
          )}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
            <Brain className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-foreground font-medium">
              AI features not configured
            </p>
            <p className="text-muted-foreground text-sm mt-1">
              Configure your AI provider to start generating insights
            </p>
          </div>
          <Link href={`/${slug}/projects/${id}/settings`}>
            <Button variant="outline" className="mt-2">
              <Settings className="w-4 h-4 mr-2" />
              Go to Settings
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  const grouped = groupByDay(insights ?? []);
  const days = Object.keys(grouped);
  const unreadCount = insights?.filter((i) => !i.isRead).length ?? 0;
  const totalCount = insights?.length ?? 0;

  const { onCooldown: initialCooldown, minutesLeft: initialMinutes } =
    getCooldownState(aiConfig?.lastTriggeredAt ?? null);

  const triggerResponse = triggerInsights.data;
  const onCooldown =
    triggerResponse?.data?.minutesRemaining !== undefined
      ? true
      : initialCooldown;
  const minutesLeft = triggerResponse?.data?.minutesRemaining ?? initialMinutes;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Insights</h1>
          <p className="text-muted-foreground mt-1">
            {totalCount === 0
              ? "No insights yet — trigger your first analysis"
              : `${totalCount} insight${totalCount !== 1 ? "s" : ""} · ${unreadCount} unread`}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {onCooldown && (
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Clock className="w-4 h-4" />
              Available in {minutesLeft}m
            </div>
          )}
          <Button
            onClick={() => triggerInsights.mutateAsync()}
            disabled={triggerInsights.isPending || onCooldown}
            variant="outline"
          >
            <RefreshCw
              className={cn(
                "w-4 h-4 mr-2",
                triggerInsights.isPending && "animate-spin",
              )}
            />
            {triggerInsights.isPending ? "Generating..." : "Generate Now"}
          </Button>
        </div>
      </div>

      {triggerInsights.isSuccess && !onCooldown && (
        <div
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg",
            "bg-brand/10 border border-brand/20",
          )}
        >
          <Sparkles className="w-5 h-5 text-brand shrink-0" />
          <p className="text-sm text-foreground">
            {triggerInsights.data?.message}
          </p>
        </div>
      )}

      {onCooldown && (
        <div
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg",
            "bg-yellow-500/10 border border-yellow-500/20",
          )}
        >
          <Clock className="w-5 h-5 text-yellow-500 shrink-0" />
          <p className="text-sm text-foreground">
            {triggerInsights.data?.message ??
              `Insights were recently generated. You can trigger again in ${minutesLeft} minute${minutesLeft !== 1 ? "s" : ""}.`}
          </p>
        </div>
      )}

      {totalCount === 0 && (
        <div
          className={cn(
            "flex flex-col items-center justify-center py-24 gap-4 rounded-lg",
            "border border-dashed border-border",
          )}
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
            <Sparkles className="w-6 h-6 text-muted-foreground" />
          </div>
          <div className="text-center">
            <p className="text-foreground font-medium">No insights yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Click &quot;Generate Now&quot; to run your first AI analysis
            </p>
          </div>
        </div>
      )}

      {days.map((day) => (
        <div key={day} className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="text-sm font-semibold text-muted-foreground">
              {day}
            </span>
            <div className="flex-1 h-px bg-border" />
            <span className="text-xs text-muted-foreground">
              {grouped[day].length} insight
              {grouped[day].length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="space-y-3">
            {grouped[day].map((insight) => (
              <InsightCard
                key={insight.id}
                insight={insight}
                onMarkRead={(id) => markRead.mutateAsync(id)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
