"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeviceDetail } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  ArrowLeft,
  Monitor,
  Smartphone,
  Tag,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

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

export default function DeviceDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;
  const projectId = params?.id as string;
  const deviceModel = decodeURIComponent(params?.deviceModel as string);

  const { data, isLoading } = useDeviceDetail(
    slug,
    productSlug,
    projectId,
    deviceModel,
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
    return <p className="text-muted-foreground">Device not found.</p>;
  }

  const crashRateColor =
    data.crashRate === 0
      ? "text-brand"
      : data.crashRate < 2
        ? "text-yellow-500"
        : "text-destructive";

  const isMobile = data.platform === "android" || data.platform === "ios";
  const DeviceIcon = isMobile ? Smartphone : Monitor;
  const maxOsEvents = Math.max(...data.osVersions.map((o) => o.events), 1);
  const maxAppEvents = Math.max(...data.appVersions.map((a) => a.events), 1);
  const maxScreen = Math.max(
    ...data.screenPerformance.map((s) => s.avgLoadTime),
    1,
  );

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={`${base}/analytics/devices`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Devices
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <DeviceIcon className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">
          {data.deviceModel}
        </h1>
        {data.manufacturer !== "unknown" && (
          <span className="text-sm text-muted-foreground">
            {data.manufacturer}
          </span>
        )}
        <Badge variant="outline" className={cn("text-sm", crashRateColor)}>
          {data.crashRate.toFixed(2)}% crash rate
        </Badge>
      </div>

      {/* Device info row */}
      <div className="flex items-center gap-4 text-sm text-muted-foreground">
        <span className="capitalize">{data.platform}</span>
        {data.os !== "unknown" && <span>{data.os}</span>}
        {data.firstSeenAt && (
          <span>
            First seen{" "}
            {new Date(data.firstSeenAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
        {data.lastSeenAt && (
          <span>
            Last seen{" "}
            {new Date(data.lastSeenAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {[
          { label: "Total Events", value: data.totalEvents.toLocaleString() },
          { label: "Total Crashes", value: data.crashes.toLocaleString() },
          { label: "Crash Rate", value: `${data.crashRate.toFixed(2)}%` },
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

      {/* OS versions + App versions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">
              OS Versions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.osVersions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No OS data
              </p>
            ) : (
              data.osVersions.map((o) => (
                <BarRow
                  key={o.osVersion}
                  label={o.osVersion}
                  value={o.events}
                  max={maxOsEvents}
                  display={`${o.events.toLocaleString()} events`}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              App Versions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.appVersions.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No version data
              </p>
            ) : (
              data.appVersions.map((a) => (
                <BarRow
                  key={a.appVersion}
                  label={`v${a.appVersion}`}
                  value={a.events}
                  max={maxAppEvents}
                  display={`${a.events.toLocaleString()} events`}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Top crashes */}
      {data.topCrashes.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Top Crashes on {data.deviceModel}
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

      {/* Screen performance */}
      {data.screenPerformance.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">
              Screen Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.screenPerformance.map((s) => (
              <BarRow
                key={s.screenName}
                label={s.screenName}
                value={s.avgLoadTime}
                max={maxScreen}
                display={`${s.views} views · ${s.avgLoadTime}ms avg`}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
