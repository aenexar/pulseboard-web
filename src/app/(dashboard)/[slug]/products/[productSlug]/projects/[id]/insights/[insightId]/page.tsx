"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useExplainInsight, useInsight, useMarkInsightRead } from "@/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { Insight, InsightSeverity, InsightTrend } from "@/types";
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowLeft,
  ArrowUp,
  Info,
  Loader2,
  Minus,
  Repeat2,
  Shield,
  Sparkles,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

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

const TREND_CONFIG: Record<
  InsightTrend,
  {
    icon: React.ElementType;
    label: string;
    className: string;
  }
> = {
  improving: { icon: TrendingUp, label: "Improving", className: "text-brand" },
  worsening: {
    icon: TrendingDown,
    label: "Worsening",
    className: "text-destructive",
  },
  stable: { icon: Minus, label: "Stable", className: "text-muted-foreground" },
};

// ─── Markdown renderer ────────────────────────────────────────────────────────

function ExplanationBlock({ text }: { text: string }) {
  const sections = text
    .split(/\*\*(.+?)\*\*/)
    .reduce<{ heading: boolean; text: string }[]>((acc, part, i) => {
      acc.push({ heading: i % 2 === 1, text: part });
      return acc;
    }, []);

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      {sections.map((section, i) => {
        if (!section.text.trim()) return null;
        if (section.heading) {
          return (
            <h4
              key={i}
              className="font-semibold text-foreground flex items-center gap-2 mt-4 first:mt-0"
            >
              <div className="w-1 h-4 rounded-full bg-brand shrink-0" />
              {section.text}
            </h4>
          );
        }
        // Split numbered steps
        const lines = section.text.split("\n").filter((l) => l.trim());
        return (
          <div key={i} className="space-y-2 pl-3">
            {lines.map((line, j) => {
              const isNumbered = /^\d+\./.test(line.trim());
              return (
                <p
                  key={j}
                  className={cn(
                    "text-muted-foreground",
                    isNumbered && "flex gap-2",
                  )}
                >
                  {line}
                </p>
              );
            })}
          </div>
        );
      })}
    </div>
  );
}

// ─── Comparison card ──────────────────────────────────────────────────────────

function ComparisonCard({ insight }: { insight: Insight }) {
  const { comparisonData: c, comparedToInsight: prev } = insight;
  if (!c || !prev) return null;

  const trend = TREND_CONFIG[c.trend];
  const TrendIcon = trend.icon;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-semibold text-foreground">
            Comparison with previous insight
          </CardTitle>
          <Badge
            variant="outline"
            className={cn("text-xs gap-1.5", trend.className)}
          >
            <TrendIcon className="w-3 h-3" />
            {trend.label}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          vs &quot;{prev.title}&quot; from{" "}
          {new Date(prev.generatedAt).toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
          })}
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary */}
        <p className="text-sm text-foreground font-medium">{c.summary}</p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {c.improvement && (
            <div className="p-3 rounded-lg bg-brand/5 border border-brand/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-brand mb-1">
                <ArrowUp className="w-3 h-3" />
                Improvement
              </div>
              <p className="text-xs text-muted-foreground">{c.improvement}</p>
            </div>
          )}
          {c.regression && (
            <div className="p-3 rounded-lg bg-destructive/5 border border-destructive/20">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-destructive mb-1">
                <ArrowDown className="w-3 h-3" />
                Regression
              </div>
              <p className="text-xs text-muted-foreground">{c.regression}</p>
            </div>
          )}
        </div>

        {/* Stats row */}
        <div className="space-y-2">
          {[
            { label: "Net change", value: c.netChange },
            { label: "Expected impact", value: c.expectedImpact },
            { label: "Recommendation", value: c.recommendation },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-3 text-xs">
              <span className="text-muted-foreground w-32 shrink-0">
                {label}
              </span>
              <span className="text-foreground">{value}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function InsightDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;
  const projectId = params?.id as string;
  const insightId = params?.insightId as string;

  const user = useAuthStore((s) => s.user);
  const explain = useExplainInsight(slug, productSlug, projectId);
  const markRead = useMarkInsightRead(slug, productSlug, projectId);

  const { data: insight, isLoading } = useInsight(
    slug,
    productSlug,
    projectId,
    insightId,
  );

  // Auto mark as read when page opens
  useEffect(() => {
    if (!insight || !user) return;
    const alreadyRead = insight.reads.some((r) => r.userId === user.id);
    if (!alreadyRead) markRead.mutate(insightId);
  }, [insight?.id, user?.id]); // TODO: Check if we need this or not

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!insight) {
    return <p className="text-muted-foreground">Insight not found.</p>;
  }

  const severity = SEVERITY_CONFIG[insight.severity];
  const isSecurity = insight.category === "security";
  const SeverityIcon = isSecurity ? Shield : severity.icon;
  const backHref = `/${slug}/products/${productSlug}/projects/${projectId}/insights`;

  return (
    <div className="space-y-6 max-w-2xl">
      {/* Back */}
      <Link
        href={backHref}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Insights
      </Link>

      {/* Header */}
      <div className="space-y-3">
        <div className="flex items-start gap-3">
          <div
            className={cn(
              "flex items-center justify-center w-9 h-9 rounded-lg shrink-0 mt-0.5",
              isSecurity
                ? "text-purple-500 border border-purple-500/30 bg-purple-500/10"
                : severity.className,
            )}
          >
            <SeverityIcon className="w-4.5 h-4.5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-foreground leading-snug">
              {insight.title}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {new Date(insight.generatedAt).toLocaleDateString("en-US", {
                weekday: "long",
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </p>
          </div>
        </div>

        {/* Badges */}
        <div className="flex items-center gap-2 flex-wrap pl-12">
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
              className="text-xs text-muted-foreground gap-1"
            >
              <Repeat2 className="w-3 h-3" />
              {insight.occurrences} days recurring
            </Badge>
          )}
          {insight.explanation && (
            <Badge
              variant="outline"
              className="text-xs text-brand border-brand/30 gap-1"
            >
              <Sparkles className="w-3 h-3" />
              Explanation generated
            </Badge>
          )}
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-foreground leading-relaxed">
            {insight.description}
          </p>
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
            Timeline
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1.5">
          {[
            {
              label: "First seen",
              value: new Date(insight.firstSeenAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            },
            {
              label: "Last seen",
              value: new Date(insight.lastSeenAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              }),
            },
            {
              label: "Generated at",
              value: new Date(insight.generatedAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-muted-foreground">{label}</span>
              <span className="text-foreground font-medium">{value}</span>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Metadata */}
      {insight.metadata && Object.keys(insight.metadata).length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Data
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1.5">
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
          </CardContent>
        </Card>
      )}

      {/* Comparison */}
      <ComparisonCard insight={insight} />

      {/* Read by */}
      {insight.reads.length > 0 && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              Read by
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {insight.reads.map((r) => (
                <div key={r.id} className="flex items-center gap-2">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={r.user.avatarUrl ?? undefined} />
                    <AvatarFallback className="text-[9px] bg-brand/10 text-brand">
                      {r.user.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-xs font-medium text-foreground">
                      {r.user.name}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {new Date(r.readAt).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* AI Explanation */}
      <Card>
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
              AI Analysis
            </CardTitle>
            <div className="flex items-center gap-3">
              {insight.explanationGeneratedBy && (
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Avatar className="w-4 h-4">
                    <AvatarImage
                      src={
                        insight.explanationGeneratedBy.avatarUrl ?? undefined
                      }
                    />
                    <AvatarFallback className="text-[8px] bg-brand/10 text-brand">
                      {insight.explanationGeneratedBy.name
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    Generated by {insight.explanationGeneratedBy.name}
                    {insight.explanationGeneratedAt && (
                      <>
                        {" "}
                        ·{" "}
                        {new Date(
                          insight.explanationGeneratedAt,
                        ).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </>
                    )}
                  </span>
                </div>
              )}
              {!insight.explanation && !explain.isPending && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => explain.mutate(insightId)}
                  className="h-7 text-xs gap-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  Generate
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {explain.isPending && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground p-3 rounded-lg bg-muted">
              <Loader2 className="w-4 h-4 animate-spin shrink-0" />
              Analysing this insight...
            </div>
          )}
          {explain.isError && (
            <p className="text-sm text-destructive">
              Failed to generate analysis. Please try again.
            </p>
          )}
          {(insight.explanation ?? explain.data) && (
            <div className="p-4 rounded-lg bg-muted border border-border">
              <ExplanationBlock
                text={insight.explanation ?? explain.data ?? ""}
              />
            </div>
          )}
          {!insight.explanation &&
            !explain.data &&
            !explain.isPending &&
            !explain.isError && (
              <p className="text-xs text-muted-foreground">
                Click Generate to get a detailed explanation and specific action
                steps from AI.
              </p>
            )}
        </CardContent>
      </Card>
    </div>
  );
}
