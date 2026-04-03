"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";
import { Insight, InsightSeverity } from "@/types";
import {
  ActivityIcon,
  AlertCircle,
  AlertTriangle,
  Brain,
  Clock,
  Info,
  RefreshCw,
  Repeat2,
  Shield,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import React from "react";

const SEVERITY_CONFIG: Record<
  InsightSeverity,
  {
    icon: React.ElementType;
    label: string;
    className: string;
  }
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

function groupByDay(insights: Insight[]): Record<string, Insight[]> {
  return insights.reduce<Record<string, Insight[]>>((acc, i) => {
    const day = new Date(i.generatedAt).toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    if (!acc[day]) acc[day] = [];
    acc[day].push(i);
    return acc;
  }, {});
}

function InsightRow({
  insight,
  detailHref,
}: {
  insight: Insight;
  detailHref: string;
}) {
  const severity = SEVERITY_CONFIG[insight.severity];
  const isSecurity = insight.category === "security";
  const Icon = isSecurity ? Shield : severity.icon;
  const isRead = insight.reads.length > 0;

  return (
    <Card className={cn("transition-all duration-200", isRead && "opacity-70")}>
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
                <Link
                  href={detailHref}
                  className={cn(
                    "text-sm font-semibold hover:text-brand transition-colors",
                    isRead ? "text-muted-foreground" : "text-foreground",
                  )}
                >
                  {insight.title}
                </Link>
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
                {insight.explanation && (
                  <Badge
                    variant="outline"
                    className="text-xs text-brand border-brand/30 gap-1"
                  >
                    <Sparkles className="w-3 h-3" />
                    Explained
                  </Badge>
                )}
              </div>

              {/* Read avatars */}
              {insight.reads.length > 0 && (
                <div className="flex items-center -space-x-1 shrink-0">
                  {insight.reads.slice(0, 3).map((r) => (
                    <Avatar
                      key={r.id}
                      className="w-5 h-5 ring-1 ring-background"
                    >
                      <AvatarImage src={r.user.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-[8px] bg-brand/10 text-brand">
                        {r.user.name.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </div>
              )}
            </div>

            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
              {insight.description}
            </p>

            <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
              {insight.occurrences > 1 && (
                <div className="flex items-center gap-1">
                  <Repeat2 className="w-3 h-3" />
                  {insight.occurrences} days
                </div>
              )}
              <div className="flex items-center gap-1">
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

export function InsightsView({
  title,
  subtitle,
  insights,
  isLoading,
  onTrigger,
  isTriggerPending,
  slug,
  productSlug,
  projectId,
  level,
}: {
  title: string;
  subtitle: string;
  insights: Insight[];
  isLoading: boolean;
  onTrigger: () => void;
  isTriggerPending: boolean;
  slug: string;
  productSlug?: string;
  projectId?: string;
  level: "project" | "product" | "org";
}) {
  const grouped = groupByDay(insights);
  const days = Object.keys(grouped);

  function getDetailHref(insight: Insight): string {
    if (level === "project" && productSlug && projectId) {
      return `/${slug}/products/${productSlug}/projects/${projectId}/insights/${insight.id}`;
    }
    if (level === "product" && productSlug) {
      return `/${slug}/products/${productSlug}/insights/${insight.id}`;
    }
    return `/${slug}/insights/${insight.id}`;
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-28" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground mt-1">{subtitle}</p>
        </div>
        <Button
          onClick={onTrigger}
          disabled={isTriggerPending}
          variant="outline"
        >
          <RefreshCw
            className={cn("w-4 h-4 mr-2", isTriggerPending && "animate-spin")}
          />
          {isTriggerPending ? "Generating..." : "Generate Now"}
        </Button>
      </div>

      {insights.length === 0 && (
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
            <p className="text-foreground font-medium">No insights yet</p>
            <p className="text-muted-foreground text-sm mt-1">
              Click Generate Now to run AI analysis
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
              <InsightRow
                key={insight.id}
                insight={insight}
                detailHref={getDetailHref(insight)}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
