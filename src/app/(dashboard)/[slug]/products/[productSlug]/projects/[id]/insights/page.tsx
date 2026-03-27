"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAiConfig,
  useExplainInsight,
  useInsights,
  useMarkInsightRead,
  useProjectStats,
  useTriggerInsights,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { Insight, InsightSeverity } from "@/types";
import {
  AlertCircle,
  AlertTriangle,
  Brain,
  CheckCheck,
  ChevronRight,
  Clock,
  Info,
  Loader2,
  RefreshCw,
  Repeat2,
  Settings,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import React, { useEffect, useState } from "react";

// ─── Constants ────────────────────────────────────────────────────────────────

const COOLDOWN_MS = 60 * 60 * 1000;
const MIN_SESSIONS_FOR_AI = 50;

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getCooldownState(lastTriggeredAt: string | null) {
  if (!lastTriggeredAt) return { onCooldown: false, minutesLeft: 0 };
  const elapsed = Date.now() - new Date(lastTriggeredAt).getTime();
  const remaining = COOLDOWN_MS - elapsed;
  if (remaining <= 0) return { onCooldown: false, minutesLeft: 0 };
  return { onCooldown: true, minutesLeft: Math.ceil(remaining / 1000 / 60) };
}

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

// ─── Severity + category config ───────────────────────────────────────────────

const SEVERITY_CONFIG: Record<
  InsightSeverity,
  { icon: React.ElementType; label: string; className: string }
> = {
  critical: {
    icon: AlertCircle,
    label: "Critical",
    className: "text-destructive border-destructive/30 bg-destructive/10",
  },
  warning: {
    icon: AlertTriangle,
    label: "Warning",
    className: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  },
  info: {
    icon: Info,
    label: "Info",
    className: "text-blue-500 border-blue-500/30 bg-blue-500/10",
  },
};

const CATEGORY_LABELS: Record<string, string> = {
  crash: "Crash",
  performance: "Performance",
  network: "Network",
  release: "Release",
  user_behaviour: "User Behaviour",
  security: "Security",
};

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  security: Shield,
};

// ─── Detail pane ──────────────────────────────────────────────────────────────

function InsightDetailPane({
  insight,
  open,
  onClose,
  slug,
  productSlug,
  projectId,
}: {
  insight: Insight | null;
  open: boolean;
  onClose: () => void;
  slug: string;
  productSlug: string;
  projectId: string;
}) {
  const explain = useExplainInsight(slug, productSlug, projectId);

  useEffect(() => {
    explain.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [insight?.id]);

  if (!insight) return null;

  const severity = SEVERITY_CONFIG[insight.severity];
  const CategoryIcon = CATEGORY_ICONS[insight.category];
  const Icon = CategoryIcon ?? severity.icon;
  const isSecurity = insight.category === "security";

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto p-8">
        <SheetHeader className="mb-6">
          <div className="flex items-start gap-3">
            <div
              className={cn(
                "flex items-center justify-center w-8 h-8 rounded-md shrink-0 mt-0.5",
                isSecurity
                  ? "text-purple-500 border-purple-500/30 bg-purple-500/10"
                  : severity.className,
              )}
            >
              <Icon className="w-4 h-4" />
            </div>
            <SheetTitle className="text-base font-semibold text-foreground leading-snug">
              {insight.title}
            </SheetTitle>
          </div>
        </SheetHeader>

        <div className="space-y-6">
          {/* Badges */}
          <div className="flex items-center gap-2 flex-wrap">
            <Badge
              variant="outline"
              className={cn("text-xs", severity.className)}
            >
              {severity.label}
            </Badge>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                isSecurity &&
                  "text-purple-500 border-purple-500/30 bg-purple-500/10",
              )}
            >
              {CATEGORY_LABELS[insight.category] ?? insight.category}
            </Badge>
            {insight.occurrences > 1 && (
              <Badge
                variant="outline"
                className="text-xs text-muted-foreground"
              >
                <Repeat2 className="w-3 h-3 mr-1" />
                {insight.occurrences} days recurring
              </Badge>
            )}
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Summary
            </p>
            <p className="text-sm text-foreground leading-relaxed">
              {insight.description}
            </p>
          </div>

          {/* Timeline */}
          <div className="space-y-1.5">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Timeline
            </p>
            <div className="space-y-1 text-sm text-muted-foreground">
              <div className="flex justify-between">
                <span>First seen</span>
                <span className="text-foreground">
                  {new Date(insight.firstSeenAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Last seen</span>
                <span className="text-foreground">
                  {new Date(insight.lastSeenAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
              </div>
              <div className="flex justify-between">
                <span>Generated at</span>
                <span className="text-foreground">
                  {new Date(insight.generatedAt).toLocaleTimeString("en-US", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          </div>

          {/* Metadata */}
          {insight.metadata && Object.keys(insight.metadata).length > 0 && (
            <div className="space-y-1.5">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Data
              </p>
              <div className="p-3 rounded-lg bg-muted border border-border space-y-1">
                {Object.entries(insight.metadata).map(([key, value]) => (
                  <div key={key} className="flex justify-between text-xs">
                    <span className="text-muted-foreground capitalize">
                      {key.replace(/_/g, " ")}
                    </span>
                    <span className="text-foreground font-mono">
                      {String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* AI detail */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                AI Analysis
              </p>
              {!explain.data && !explain.isPending && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => explain.mutate(insight.id)}
                  className="h-7 text-xs gap-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate
                </Button>
              )}
            </div>

            {explain.isPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted border border-border">
                <Loader2 className="w-4 h-4 animate-spin shrink-0" />
                Analysing this insight...
              </div>
            )}

            {explain.isError && (
              <p className="text-sm text-destructive">
                Failed to generate analysis. Please try again.
              </p>
            )}

            {explain.data && (
              <div className="p-3 rounded-lg bg-muted border border-border text-sm leading-relaxed whitespace-pre-wrap">
                {explain.data.split("\n").map((line, i) => (
                  <p
                    key={i}
                    className={cn(
                      line.startsWith("**")
                        ? "font-semibold text-foreground"
                        : "text-muted-foreground",
                    )}
                  >
                    {line.replace(/\*\*/g, "")}
                  </p>
                ))}
              </div>
            )}

            {!explain.data && !explain.isPending && !explain.isError && (
              <p className="text-xs text-muted-foreground">
                Click Generate to get a detailed explanation and specific action
                steps from AI.
              </p>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

// ─── Insight card ─────────────────────────────────────────────────────────────

function InsightCard({
  insight,
  onMarkRead,
  onOpen,
}: {
  insight: Insight;
  onMarkRead: (id: string) => void;
  onOpen: (insight: Insight) => void;
}) {
  const severity = SEVERITY_CONFIG[insight.severity];
  const CategoryIcon = CATEGORY_ICONS[insight.category];
  const Icon = CategoryIcon ?? severity.icon;
  const isSecurity = insight.category === "security";

  const firstSeen = new Date(insight.firstSeenAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
  const isRecurring = insight.occurrences > 1;

  return (
    <Card
      className={cn(
        "transition-opacity duration-200 cursor-pointer hover:border-brand/30",
        insight.isRead && "opacity-60",
      )}
    >
      <CardContent className="pt-4">
        <div className="flex items-start gap-4">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-md shrink-0",
              isSecurity
                ? "text-purple-500 border-purple-500/30 bg-purple-500/10"
                : severity.className,
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
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs",
                    isSecurity &&
                      "text-purple-500 border-purple-500/30 bg-purple-500/10",
                  )}
                >
                  {CATEGORY_LABELS[insight.category] ?? insight.category}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn("text-xs", severity.className)}
                >
                  {severity.label}
                </Badge>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {insight.isRead ? (
                  <CheckCheck className="w-4 h-4 text-brand" />
                ) : (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onMarkRead(insight.id);
                    }}
                    className="text-muted-foreground hover:text-brand transition-colors"
                    aria-label="Mark as read"
                  >
                    <CheckCheck className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => onOpen(insight)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                  aria-label="View detail"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
              {insight.description}
            </p>

            <div className="flex items-center gap-4 mt-3">
              {isRecurring ? (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Repeat2 className="w-3 h-3" />
                  Recurring · {insight.occurrences} days · First seen{" "}
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InsightsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = params?.id as string;
  const productSlug = params?.productSlug as string;

  const { data: insights, isLoading: insightsLoading } = useInsights(
    slug,
    productSlug,
    id,
  );
  const { data: aiConfig, isLoading: configLoading } = useAiConfig(
    slug,
    productSlug,
    id,
  );
  const { data: stats } = useProjectStats(slug, productSlug, id);
  const triggerInsights = useTriggerInsights(slug, productSlug, id);
  const markRead = useMarkInsightRead(slug, productSlug, id);

  const [selectedInsight, setSelectedInsight] = useState<Insight | null>(null);
  const [paneOpen, setPaneOpen] = useState(false);

  const isLoading = insightsLoading || configLoading;

  const openDetail = (insight: Insight) => {
    setSelectedInsight(insight);
    setPaneOpen(true);
    if (!insight.isRead) markRead.mutate(insight.id);
  };

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

  // No AI config
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
          <Link
            href={`/${slug}/products/${productSlug}/projects/${id}/settings/ai`}
          >
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
  const totalSessions = stats?.totalSessions ?? 0;
  const hasEnoughData = totalSessions >= MIN_SESSIONS_FOR_AI;

  const { onCooldown: initialCooldown, minutesLeft: initialMinutes } =
    getCooldownState(aiConfig?.lastTriggeredAt ?? null);

  const triggerResponse = triggerInsights.data;
  const onCooldown =
    triggerResponse?.data?.minutesRemaining !== undefined
      ? true
      : initialCooldown;
  const minutesLeft = triggerResponse?.data?.minutesRemaining ?? initialMinutes;

  return (
    <>
      <div className="space-y-8">
        {/* Header */}
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
              disabled={
                triggerInsights.isPending || onCooldown || !hasEnoughData
              }
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

        {/* Not enough data warning */}
        {!hasEnoughData && (
          <div
            className={cn(
              "flex items-start gap-3 p-4 rounded-lg",
              "bg-yellow-500/10 border border-yellow-500/20",
            )}
          >
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-foreground">
                Not enough data yet
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                AI insights require at least {MIN_SESSIONS_FOR_AI} sessions to
                generate meaningful analysis. You currently have {totalSessions}{" "}
                session
                {totalSessions !== 1 ? "s" : ""}. Keep the SDK running and check
                back soon.
              </p>
            </div>
          </div>
        )}

        {/* Success banner */}
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

        {/* Cooldown banner */}
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

        {/* Empty state */}
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
                {hasEnoughData
                  ? 'Click "Generate Now" to run your first AI analysis'
                  : "Send more events from your app to unlock AI analysis"}
              </p>
            </div>
          </div>
        )}

        {/* Insights grouped by day */}
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
                  onOpen={openDetail}
                />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Detail pane */}
      <InsightDetailPane
        insight={selectedInsight}
        open={paneOpen}
        onClose={() => setPaneOpen(false)}
        slug={slug}
        productSlug={productSlug}
        projectId={id}
      />
    </>
  );
}
