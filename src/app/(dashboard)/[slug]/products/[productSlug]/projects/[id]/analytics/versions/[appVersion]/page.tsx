"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVersionDetail } from "@/hooks";
import { cn } from "@/lib/utils";
import { AlertTriangle, ArrowLeft, Globe, Monitor, Tag } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function BarRow({
  label,
  value,
  max,
  display,
}: {
  label: string;
  value: number;
  max: number;
  display: string;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-foreground font-medium truncate">{label}</span>
        <span className="text-muted-foreground shrink-0 ml-4">{display}</span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div
          className="h-full bg-brand rounded-full transition-all duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export default function VersionDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;
  const projectId = params?.id as string;
  const appVersion = decodeURIComponent(params?.appVersion as string);

  const { data, isLoading } = useVersionDetail(
    slug,
    productSlug,
    projectId,
    appVersion,
  );

  const base = `/${slug}/products/${productSlug}/projects/${projectId}`;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted-foreground">Version not found.</p>;
  }

  const crashRateColor =
    data.crashRate === 0
      ? "text-brand"
      : data.crashRate < 2
        ? "text-yellow-500"
        : "text-destructive";

  const maxScreen = Math.max(
    ...data.screenPerformance.map((s) => s.avgLoadTime),
    1,
  );
  const maxApi = Math.max(...data.apiPerformance.map((a) => a.avgDuration), 1);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={`${base}/analytics/versions`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Versions
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Tag className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground font-mono">
          v{data.appVersion}
        </h1>
        <Badge variant="outline" className={cn("text-sm", crashRateColor)}>
          {data.crashRate.toFixed(2)}% crash rate
        </Badge>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          {
            label: "Total Sessions",
            value: data.totalSessions.toLocaleString(),
          },
          {
            label: "Crashed Sessions",
            value: data.crashedSessions.toLocaleString(),
          },
          { label: "Total Crashes", value: data.crashes.toLocaleString() },
          {
            label: "Crash-Free Rate",
            value: `${(100 - data.crashRate).toFixed(2)}%`,
          },
        ].map(({ label, value }) => (
          <Card key={label}>
            <CardContent className="pt-4">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="text-xl font-bold text-foreground mt-0.5">
                {value}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Dates */}
      {(data.firstSeenAt || data.lastSeenAt) && (
        <div className="flex items-center gap-6 text-sm text-muted-foreground">
          {data.firstSeenAt && (
            <span>
              First session:{" "}
              {new Date(data.firstSeenAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
          {data.lastSeenAt && (
            <span>
              Latest session:{" "}
              {new Date(data.lastSeenAt).toLocaleDateString("en-US", {
                month: "long",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          )}
        </div>
      )}

      {/* Top crashes */}
      {data.topCrashes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Top Crashes on v{data.appVersion}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.topCrashes.map((c, i) => (
              <div
                key={i}
                className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">
                    {c.errorName ?? "Unknown error"}
                  </p>
                  <p className="text-xs text-muted-foreground truncate mt-0.5">
                    {c.errorMessage}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge
                    variant="outline"
                    className="text-destructive border-destructive/30 text-xs"
                  >
                    {c.occurrences}{" "}
                    {c.occurrences === 1 ? "occurrence" : "occurrences"}
                  </Badge>
                  {c.crashGroupId && (
                    <Link
                      href={`${base}/analytics/crashes/${c.crashGroupId}`}
                      className="text-xs text-brand hover:underline"
                    >
                      View →
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Performance grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Monitor className="w-4 h-4 text-muted-foreground" />
              Screen Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.screenPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No screen data for this version
              </p>
            ) : (
              data.screenPerformance.map((s) => (
                <BarRow
                  key={s.screenName}
                  label={s.screenName}
                  value={s.avgLoadTime}
                  max={maxScreen}
                  display={`${s.views} views · ${formatDuration(s.avgLoadTime)}`}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Globe className="w-4 h-4 text-muted-foreground" />
              API Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.apiPerformance.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No API data for this version
              </p>
            ) : (
              data.apiPerformance.map((a) => (
                <BarRow
                  key={a.endpoint}
                  label={a.endpoint}
                  value={a.avgDuration}
                  max={maxApi}
                  display={`${a.calls} calls · ${formatDuration(a.avgDuration)}`}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
