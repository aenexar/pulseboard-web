"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiEndpointDetail } from "@/hooks";
import { cn } from "@/lib/utils";
import { ArrowLeft, Globe, Smartphone, Tag } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return "—";
  if (bytes < 1024) return `${bytes}B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)}KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)}MB`;
}

function methodColor(method: string) {
  switch (method.toUpperCase()) {
    case "GET":
      return "text-brand     border-brand/30     bg-brand/10";
    case "POST":
      return "text-blue-500  border-blue-500/30  bg-blue-500/10";
    case "PUT":
    case "PATCH":
      return "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
    case "DELETE":
      return "text-destructive border-destructive/30 bg-destructive/10";
    default:
      return "text-muted-foreground border-border";
  }
}

function statusColor(code: number) {
  if (code < 300) return "text-brand";
  if (code < 400) return "text-blue-500";
  if (code < 500) return "text-yellow-500";
  return "text-destructive";
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
  payload?: { value: number; name: string; color: string }[];
  label?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-sm space-y-1">
      <p className="text-xs text-muted-foreground">{label}</p>
      {payload.map((p) => (
        <p
          key={p.name}
          className="text-xs font-semibold"
          style={{ color: p.color }}
        >
          {p.name === "avgDuration"
            ? formatMs(p.value)
            : p.name === "failed"
              ? `${p.value} failed`
              : `${p.value} calls`}
        </p>
      ))}
    </div>
  );
}

export default function ApiEndpointDetailPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;
  const projectId = params?.id as string;
  const endpoint = decodeURIComponent(params?.endpoint as string);
  const method = searchParams.get("method") ?? undefined;

  const { data, isLoading } = useApiEndpointDetail(
    slug,
    productSlug,
    projectId,
    endpoint,
    method,
  );

  const base = `/${slug}/products/${productSlug}/projects/${projectId}`;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-32" />
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (!data) {
    return <p className="text-muted-foreground">Endpoint not found.</p>;
  }

  const maxVersion = Math.max(...data.byVersion.map((v) => v.avgDuration), 1);
  const maxDevice = Math.max(...data.byDevice.map((d) => d.avgDuration), 1);
  const maxStatus = Math.max(...data.byStatusCode.map((s) => s.calls), 1);

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={`${base}/analytics/api`}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to API Performance
      </Link>

      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3 flex-wrap">
          <Badge
            variant="outline"
            className={cn("font-mono", methodColor(data.httpMethod))}
          >
            {data.httpMethod}
          </Badge>
          <h1 className="text-xl font-bold text-foreground font-mono break-all">
            {data.endpoint}
          </h1>
        </div>
        {(data.firstSeenAt || data.lastSeenAt) && (
          <p className="text-sm text-muted-foreground">
            {data.firstSeenAt &&
              `First seen ${new Date(data.firstSeenAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
            {data.firstSeenAt && data.lastSeenAt && " · "}
            {data.lastSeenAt &&
              `Last seen ${new Date(data.lastSeenAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total Calls", value: data.totalCalls.toLocaleString() },
          { label: "Failed Calls", value: data.failedCalls.toLocaleString() },
          { label: "Failure Rate", value: `${data.failureRate.toFixed(2)}%` },
          { label: "Avg Duration", value: formatMs(data.avgDuration) },
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

      {/* Secondary stats */}
      <div className="flex items-center gap-6 text-sm text-muted-foreground px-1">
        <span>
          Min:{" "}
          <span className="text-foreground font-medium">
            {formatMs(data.minDuration)}
          </span>
        </span>
        <span>
          Max:{" "}
          <span className="text-foreground font-medium">
            {formatMs(data.maxDuration)}
          </span>
        </span>
        {data.avgPayload > 0 && (
          <span>
            Avg payload:{" "}
            <span className="text-foreground font-medium">
              {formatBytes(data.avgPayload)}
            </span>
          </span>
        )}
      </div>

      {/* Trend chart */}
      {data.trend.some((t) => t.calls > 0) && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold text-foreground">
              Calls & Duration — last 14 days
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
                  yAxisId="calls"
                  tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
                  axisLine={false}
                  tickLine={false}
                  width={30}
                  allowDecimals={false}
                />
                <YAxis
                  yAxisId="duration"
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
                        payload as unknown as {
                          value: number;
                          name: string;
                          color: string;
                        }[]
                      }
                      label={String(label)}
                    />
                  )}
                />
                <Bar
                  yAxisId="calls"
                  dataKey="calls"
                  fill="hsl(var(--brand))"
                  radius={[3, 3, 0, 0]}
                  opacity={0.85}
                />
                <Bar
                  yAxisId="calls"
                  dataKey="failed"
                  fill="hsl(var(--destructive))"
                  radius={[3, 3, 0, 0]}
                  opacity={0.7}
                />
                <Line
                  yAxisId="duration"
                  dataKey="avgDuration"
                  stroke="hsl(var(--yellow-500))"
                  strokeWidth={2}
                  dot={false}
                  type="monotone"
                />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Status codes + by version */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground">
              Status Code Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {data.byStatusCode.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No status data
              </p>
            ) : (
              data.byStatusCode.map((s) => (
                <div
                  key={s.statusCode}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={cn(
                        "text-sm font-mono font-bold",
                        statusColor(s.statusCode),
                      )}
                    >
                      {s.statusCode}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {s.statusCode < 300
                        ? "Success"
                        : s.statusCode < 400
                          ? "Redirect"
                          : s.statusCode < 500
                            ? "Client Error"
                            : "Server Error"}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full",
                          s.statusCode < 300
                            ? "bg-brand"
                            : s.statusCode < 400
                              ? "bg-blue-500"
                              : s.statusCode < 500
                                ? "bg-yellow-500"
                                : "bg-destructive",
                        )}
                        style={{
                          width: `${Math.round((s.calls / maxStatus) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-16 text-right">
                      {s.calls.toLocaleString()} calls
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Tag className="w-4 h-4 text-muted-foreground" />
              Avg Duration by Version
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
                  value={v.avgDuration}
                  max={maxVersion}
                  display={`${v.calls.toLocaleString()} calls · ${formatMs(v.avgDuration)}`}
                />
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* By device */}
      {data.byDevice.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-muted-foreground" />
              Avg Duration by Device
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {data.byDevice.map((d) => (
              <BarRow
                key={d.deviceModel}
                label={d.deviceModel}
                value={d.avgDuration}
                max={maxDevice}
                display={`${d.calls.toLocaleString()} calls · ${formatMs(d.avgDuration)}`}
              />
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
