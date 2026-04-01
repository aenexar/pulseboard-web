"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useScreenDetail } from "@/hooks";
import { ArrowLeft, Monitor, Smartphone, Tag } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatMs(ms: number): string {
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

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number; name: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-sm space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <p key={p.name} className="text-xs font-semibold text-foreground">
          {p.name === "avgLoad" ? formatMs(p.value) : `${p.value} views`}
        </p>
      ))}
    </div>
  );
}

export default function ScreenDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;
  const projectId = params?.id as string;
  const screenName = decodeURIComponent(params?.screenName as string);

  const { data, isLoading } = useScreenDetail(
    slug,
    productSlug,
    projectId,
    screenName,
  );

  const base = `/${slug}/products/${productSlug}/projects/${projectId}`;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted-foreground">Screen not found.</p>;
  }

  const maxVersion = Math.max(...data.byVersion.map((v) => v.avgLoadTime), 1);
  const maxDevice = Math.max(...data.byDevice.map((d) => d.avgLoadTime), 1);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={`${base}/analytics/screens`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Screens
      </Link>

      {/* Header */}
      <div className="flex items-center gap-3">
        <Monitor className="w-5 h-5 text-muted-foreground" />
        <h1 className="text-2xl font-bold text-foreground">
          {data.screenName}
        </h1>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Views", value: data.totalViews.toLocaleString() },
          {
            label: "Avg Load Time",
            value: data.avgLoadTime > 0 ? formatMs(data.avgLoadTime) : "—",
          },
          {
            label: "Avg Time Spent",
            value: data.avgTimeSpent > 0 ? formatMs(data.avgTimeSpent) : "—",
          },
          {
            label: "Load Range",
            value:
              data.minLoadTime > 0
                ? `${formatMs(data.minLoadTime)} – ${formatMs(data.maxLoadTime)}`
                : "—",
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

      {/* Trend chart */}
      {data.trend.some((t) => t.views > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Views & Load Time — last 14 days
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={data.trend} barSize={16}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(var(--border))"
                  vertical={false}
                />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  interval={1}
                />
                <YAxis
                  yAxisId="views"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="load"
                  orientation="right"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={40}
                  tickFormatter={(v) => `${v}ms`}
                />
                <Tooltip
                  content={({ active, payload, label }) => (
                    <ChartTooltip
                      active={active}
                      payload={
                        payload as unknown as { value: number; name: string }[]
                      }
                      label={String(label)}
                    />
                  )}
                />
                <Bar
                  yAxisId="views"
                  dataKey="views"
                  fill="hsl(var(--brand))"
                  radius={[3, 3, 0, 0]}
                  opacity={0.85}
                />
                <Line
                  yAxisId="load"
                  dataKey="avgLoad"
                  stroke="hsl(var(--destructive))"
                  strokeWidth={2}
                  dot={false}
                  type="monotone"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* By version + by device */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Load Time by Version
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.byVersion.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No version data
              </p>
            ) : (
              data.byVersion.map((v) => (
                <BarRow
                  key={v.appVersion}
                  label={`v${v.appVersion}`}
                  value={v.avgLoadTime}
                  max={maxVersion}
                  display={`${v.views.toLocaleString()} views · ${formatMs(v.avgLoadTime)}`}
                />
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              Load Time by Device
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.byDevice.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No device data
              </p>
            ) : (
              data.byDevice.map((d) => (
                <BarRow
                  key={d.deviceModel}
                  label={d.deviceModel}
                  value={d.avgLoadTime}
                  max={maxDevice}
                  display={`${d.views.toLocaleString()} views · ${formatMs(d.avgLoadTime)}`}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
