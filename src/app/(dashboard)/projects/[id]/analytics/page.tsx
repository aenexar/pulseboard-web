"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAnalytics } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Globe,
  Monitor,
  Smartphone,
  TrendingDown,
} from "lucide-react";
import { useParams } from "next/navigation";
import React from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDuration(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function severityColor(
  value: number,
  thresholds: { warn: number; critical: number },
) {
  if (value >= thresholds.critical) return "text-destructive";
  if (value >= thresholds.warn) return "text-yellow-500";
  return "text-brand";
}

// ─── Stat Card ────────────────────────────────────────────────────────────────

function StatCard({
  label,
  value,
  sub,
  icon: Icon,
  valueClassName,
}: {
  label: string;
  value: string | number;
  sub?: string;
  icon: React.ElementType;
  valueClassName?: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        <Icon className="w-4 h-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div
          className={cn("text-2xl font-bold text-foreground", valueClassName)}
        >
          {value}
        </div>
        {sub && <p className="text-xs text-muted-foreground mt-1">{sub}</p>}
      </CardContent>
    </Card>
  );
}

// ─── Section Header ───────────────────────────────────────────────────────────

function SectionHeader({ title, sub }: { title: string; sub?: string }) {
  return (
    <div>
      <h2 className="text-lg font-semibold text-foreground">{title}</h2>
      {sub && <p className="text-sm text-muted-foreground mt-0.5">{sub}</p>}
    </div>
  );
}

// ─── Bar Row ──────────────────────────────────────────────────────────────────

function BarRow({
  label,
  value,
  max,
  display,
  badge,
}: {
  label: string;
  value: number;
  max: number;
  display: string;
  badge?: React.ReactNode;
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-foreground font-medium truncate">{label}</span>
          {badge}
        </div>
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const params = useParams();
  const projectId = params?.id as string;

  const { data, isLoading } = useAnalytics(projectId);

  console.log({ projectId, data });

  if (isLoading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center py-24 text-muted-foreground">
        Failed to load analytics data.
      </div>
    );
  }

  const {
    crashRate,
    topCrashes,
    crashesByVersion,
    crashesByDevice,
    apiPerformance,
    screenPerformance,
  } = data;

  const maxCrashesByVersion = Math.max(
    ...crashesByVersion.map((v) => v.crashes),
    1,
  );
  const maxCrashesByDevice = Math.max(
    ...crashesByDevice.map((d) => d.crashes),
    1,
  );
  const maxApiDuration = Math.max(
    ...apiPerformance.map((a) => a.avgDuration),
    1,
  );
  const maxScreenLoad = Math.max(
    ...screenPerformance.map((s) => s.avgLoadTime),
    1,
  );

  return (
    <div className="space-y-10">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Analytics</h1>
        <p className="text-muted-foreground mt-1">
          Crash rate, performance and device breakdown — last 7 days
        </p>
      </div>

      {/* Crash Rate Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Sessions"
          value={crashRate.totalSessions.toLocaleString()}
          icon={Activity}
        />
        <StatCard
          label="Crashed Sessions"
          value={crashRate.crashedSessions.toLocaleString()}
          icon={AlertTriangle}
          valueClassName={severityColor(crashRate.crashRate, {
            warn: 5,
            critical: 15,
          })}
        />
        <StatCard
          label="Crash Rate"
          value={`${crashRate.crashRate.toFixed(2)}%`}
          icon={TrendingDown}
          valueClassName={severityColor(crashRate.crashRate, {
            warn: 5,
            critical: 15,
          })}
        />
        <StatCard
          label="Crash-Free Users"
          value={`${crashRate.crashFreeUsers.toFixed(2)}%`}
          icon={CheckCircle2}
          valueClassName={
            crashRate.crashFreeUsers >= 99
              ? "text-brand"
              : crashRate.crashFreeUsers >= 95
                ? "text-yellow-500"
                : "text-destructive"
          }
        />
      </div>

      {/* Top Crashes */}
      <div className="space-y-4">
        <SectionHeader
          title="Top Crashes"
          sub="Most frequently occurring errors — last 30 days"
        />

        {topCrashes.length === 0 ? (
          <div
            className={cn(
              "flex items-center gap-3 p-6 rounded-lg",
              "bg-brand/10 border border-brand/20",
            )}
          >
            <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />
            <p className="text-sm text-foreground font-medium">
              No crashes recorded — your app is crash-free!
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {topCrashes.map((crash) => (
              <Card key={crash.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          {crash.errorName}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-destructive border-destructive/30 text-xs"
                        >
                          {crash.occurrences} occurrences
                        </Badge>
                        {crash.resolved && (
                          <Badge
                            variant="outline"
                            className="text-brand border-brand/30 text-xs"
                          >
                            Resolved
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 truncate">
                        {crash.errorMessage}
                      </p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-xs text-muted-foreground">
                          First seen{" "}
                          {new Date(crash.firstSeenAt).toLocaleDateString()}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          Last seen{" "}
                          {new Date(crash.lastSeenAt).toLocaleDateString()}
                        </span>
                        {crash.affectedUsers > 0 && (
                          <span className="text-xs text-muted-foreground">
                            {crash.affectedUsers} affected users
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Two column breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Crashes by Version */}
        <div className="space-y-4">
          <SectionHeader
            title="By Version"
            sub="Crash distribution across app versions"
          />
          <Card>
            <CardContent className="pt-6 space-y-4">
              {crashesByVersion.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No version data available
                </p>
              ) : (
                crashesByVersion.map((v) => (
                  <BarRow
                    key={v.appVersion}
                    label={`v${v.appVersion}`}
                    value={v.crashes}
                    max={maxCrashesByVersion}
                    display={`${v.crashes} crash${v.crashes !== 1 ? "es" : ""}`}
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Crashes by Device */}
        <div className="space-y-4">
          <SectionHeader
            title="By Device"
            sub="Crash distribution across device models"
          />
          <Card>
            <CardContent className="pt-6 space-y-4">
              {crashesByDevice.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No device data available
                </p>
              ) : (
                crashesByDevice.map((d) => (
                  <BarRow
                    key={d.deviceModel}
                    label={d.deviceModel}
                    value={d.crashes}
                    max={maxCrashesByDevice}
                    display={`${d.crashes} crash${d.crashes !== 1 ? "es" : ""}`}
                    badge={
                      <Smartphone className="w-3 h-3 text-muted-foreground shrink-0" />
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* API Performance */}
        <div className="space-y-4">
          <SectionHeader
            title="API Performance"
            sub="Average response times — slowest first"
          />
          <Card>
            <CardContent className="pt-6 space-y-4">
              {apiPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No API call data available
                </p>
              ) : (
                apiPerformance.map((a) => (
                  <BarRow
                    key={a.endpoint}
                    label={a.endpoint}
                    value={a.avgDuration}
                    max={maxApiDuration}
                    display={formatDuration(a.avgDuration)}
                    badge={
                      <Globe className="w-3 h-3 text-muted-foreground shrink-0" />
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>

        {/* Screen Performance */}
        <div className="space-y-4">
          <SectionHeader
            title="Screen Performance"
            sub="Average load times — slowest first"
          />
          <Card>
            <CardContent className="pt-6 space-y-4">
              {screenPerformance.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No screen view data available
                </p>
              ) : (
                screenPerformance.map((s) => (
                  <BarRow
                    key={s.screenName}
                    label={s.screenName}
                    value={s.avgLoadTime}
                    max={maxScreenLoad}
                    display={formatDuration(s.avgLoadTime)}
                    badge={
                      <Monitor className="w-3 h-3 text-muted-foreground shrink-0" />
                    }
                  />
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
