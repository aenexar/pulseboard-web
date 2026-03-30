"use client";

import { EnvironmentSwitcher } from "@/components/dashboard/environment-switcher";
import { EventsFeed } from "@/components/dashboard/events-feed";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useProject,
  useProjectChart,
  useProjectStats,
  useRealtimeLogs,
} from "@/hooks";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import { cn } from "@/lib/utils";
import { Framework, FRAMEWORK_LABELS } from "@/types";
import {
  Activity,
  AlertTriangle,
  Bug,
  Copy,
  Info,
  Play,
  ScrollText,
  Settings,
  Square,
  Timer,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
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

// ─── Types ────────────────────────────────────────────────────────────────────

type LogLevel = "all" | "debug" | "info" | "warn" | "error";

type LiveLog = {
  id: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  meta: Record<string, unknown> | null;
  sessionId: string | null;
  appVersion: string | null;
  timestamp: string;
  receivedAt: string;
};

// ─── Config ───────────────────────────────────────────────────────────────────

const LEVEL_CONFIG = {
  debug: {
    label: "Debug",
    color: "text-muted-foreground",
    bg: "bg-muted",
    icon: Bug,
  },
  info: {
    label: "Info",
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    icon: Info,
  },
  warn: {
    label: "Warn",
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    icon: AlertTriangle,
  },
  error: {
    label: "Error",
    color: "text-destructive",
    bg: "bg-destructive/10",
    icon: AlertTriangle,
  },
};

// ─── Chart tooltip ────────────────────────────────────────────────────────────

function ChartTooltip({
  active,
  payload,
  label,
  valueKey,
  unit = "",
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string | number;
  valueKey: string;
  unit?: string;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-card border border-border rounded-lg px-3 py-2 shadow-sm">
      <p className="text-xs text-muted-foreground mb-0.5">{String(label)}</p>
      <p className="text-sm font-semibold text-foreground">
        {payload[0].value}
        {unit} {valueKey}
      </p>
    </div>
  );
}

// ─── Log row ──────────────────────────────────────────────────────────────────

function LiveLogRow({ log }: { log: LiveLog }) {
  const [expanded, setExpanded] = useState(false);
  const config = LEVEL_CONFIG[log.level] ?? LEVEL_CONFIG.info;
  const Icon = config.icon;

  return (
    <div
      className="font-mono text-xs border-b border-border last:border-0 cursor-pointer hover:bg-accent/50 transition-colors animate-in fade-in slide-in-from-top-1 duration-200"
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-2 px-3 py-2">
        <div
          className={cn(
            "flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold w-12 justify-center",
            config.bg,
            config.color,
          )}
        >
          <Icon className="w-2.5 h-2.5" />
          {config.label}
        </div>
        <span className="text-muted-foreground shrink-0 w-16 text-[10px] pt-0.5">
          {new Date(log.timestamp).toLocaleTimeString()}
        </span>
        <span
          className={cn(
            "flex-1 truncate",
            config.color,
            expanded && "whitespace-pre-wrap break-all",
          )}
        >
          {log.message}
        </span>
        <span className="text-[10px] text-brand shrink-0">LIVE</span>
      </div>
      {expanded && log.meta && (
        <div className="px-3 pb-2 ml-[5.5rem]">
          <pre className="text-[10px] text-muted-foreground bg-muted p-2 rounded overflow-auto max-h-32">
            {JSON.stringify(log.meta, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProjectPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const projectId = params?.id as string;
  const productSlug = params?.productSlug as string;

  const { data: project, isLoading } = useProject(slug, productSlug, projectId);
  const { data: stats, isLoading: statsLoading } = useProjectStats(
    slug,
    productSlug,
    projectId,
  );
  const { data: chart, isLoading: chartLoading } = useProjectChart(
    slug,
    productSlug,
    projectId,
  );

  const [liveEnabled, setLiveEnabled] = useState(false);
  const [logLevel, setLogLevel] = useState<LogLevel>("all");

  const {
    events,
    connected: eventsConnected,
    start: startEvents,
    stop: stopEvents,
    clearEvents,
  } = useRealtimeEvents(projectId, 30);

  const {
    logs,
    connected: logsConnected,
    start: startLogs,
    stop: stopLogs,
    clearLogs,
  } = useRealtimeLogs(projectId, 100);

  const connected = eventsConnected || logsConnected;

  const startFeed = () => {
    setLiveEnabled(true);
    startEvents();
    startLogs();
  };
  const stopFeed = () => {
    setLiveEnabled(false);
    stopEvents();
    stopLogs();
  };
  const clearFeed = () => {
    clearEvents();
    clearLogs();
  };

  const [copied, setCopied] = useState(false);
  const copyApiKey = () => {
    if (!project) return;
    navigator.clipboard.writeText(project.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredLogs =
    logLevel === "all" ? logs : logs.filter((l) => l.level === logLevel);
  const logCounts = logs.reduce(
    (acc, l) => {
      acc[l.level] = (acc[l.level] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  if (isLoading || !productSlug) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  if (!project) {
    return <div className="text-muted-foreground">Project not found.</div>;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-foreground">
              {project.name}
            </h1>
            {project.framework && (
              <Badge variant="outline" className="text-brand border-brand/30">
                {FRAMEWORK_LABELS[project.framework as Framework] ??
                  project.framework}
              </Badge>
            )}
          </div>
          {project.description && (
            <p className="text-muted-foreground text-sm max-w-xl">
              {project.description}
            </p>
          )}
          <p className="text-muted-foreground text-sm">
            {project._count?.events ?? 0} total events
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <EnvironmentSwitcher />
          <Link
            href={`/${slug}/products/${productSlug}/projects/${projectId}/settings`}
          >
            <Button variant="outline" size="sm" className="gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </Button>
          </Link>
          <Badge variant="outline" className="text-brand border-brand/30">
            Active
          </Badge>
        </div>
      </div>

      {/* API Key */}
      <div className="p-4 rounded-lg bg-card border border-border">
        <p className="text-sm font-medium text-muted-foreground mb-2">
          API Key
        </p>
        <div className="flex items-center gap-2">
          <code className="flex-1 text-sm font-mono text-foreground bg-accent px-3 py-2 rounded-md truncate">
            {project.apiKey}
          </code>
          <Button
            variant="outline"
            size="icon"
            className="shrink-0"
            onClick={copyApiKey}
          >
            <Copy className="w-4 h-4" />
          </Button>
        </div>
        {copied && (
          <p className="text-xs text-brand mt-2">Copied to clipboard!</p>
        )}
      </div>

      {/* Stats */}
      {statsLoading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : (
        stats && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatsCard
              title="Sessions (7d)"
              value={stats.totalSessions.toLocaleString()}
              icon={Activity}
            />
            <StatsCard
              title="Crash Rate (7d)"
              value={`${stats.crashRate}%`}
              icon={AlertTriangle}
              variant={
                stats.crashRate === 0
                  ? "success"
                  : stats.crashRate < 2
                    ? "default"
                    : "danger"
              }
            />
            <StatsCard
              title="Errors (7d)"
              value={stats.totalErrors.toLocaleString()}
              icon={AlertTriangle}
              variant={stats.totalErrors === 0 ? "success" : "default"}
            />
            <StatsCard
              title="Avg Session"
              value={
                stats.avgSessionMinutes < 60
                  ? `${stats.avgSessionMinutes}m`
                  : `${Math.floor(stats.avgSessionMinutes / 60)}h ${stats.avgSessionMinutes % 60}m`
              }
              icon={Timer}
            />
          </div>
        )
      )}

      {/* Charts */}
      {chartLoading ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <Skeleton className="h-56" />
          <Skeleton className="h-56" />
        </div>
      ) : (
        chart && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Sessions — last 7 days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={chart} barSize={20}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                      allowDecimals={false}
                    />
                    <Tooltip
                      content={({ active, payload, label }) => (
                        <ChartTooltip
                          active={active}
                          payload={payload as unknown as { value: number }[]}
                          label={label}
                          valueKey="sessions"
                        />
                      )}
                    />
                    <Bar
                      dataKey="sessions"
                      fill="hsl(var(--brand))"
                      radius={[3, 3, 0, 0]}
                      opacity={0.85}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  Crash Rate % — last 7 days
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={180}>
                  <LineChart data={chart}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="hsl(var(--border))"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="label"
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{
                        fontSize: 11,
                        fill: "hsl(var(--muted-foreground))",
                      }}
                      axisLine={false}
                      tickLine={false}
                      width={30}
                      unit="%"
                    />
                    <Tooltip
                      content={({ active, payload, label }) => (
                        <ChartTooltip
                          active={active}
                          payload={payload as unknown as { value: number }[]}
                          label={label}
                          valueKey="crash rate"
                          unit="%"
                        />
                      )}
                    />
                    <Line
                      type="monotone"
                      dataKey="crashRate"
                      stroke="hsl(var(--destructive))"
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--destructive))", r: 3 }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* ── Live Feed ──────────────────────────────────────────────────────── */}
      <div className="space-y-4">
        {/* Feed header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">Live Feed</h2>
            {liveEnabled && connected && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                <span className="text-xs text-muted-foreground font-mono">
                  live
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {liveEnabled && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={clearFeed}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
            <Button
              size="sm"
              onClick={liveEnabled ? stopFeed : startFeed}
              variant="ghost"
              className={cn(
                "gap-2 font-medium",
                liveEnabled
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                  : "bg-brand/10 text-brand hover:bg-brand/20 border border-brand/20",
              )}
            >
              {liveEnabled ? (
                <>
                  <Square className="w-3.5 h-3.5 fill-current" />
                  Stop
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5 fill-current" />
                  Start Live Feed
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Split panel — always visible */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Left — Live Events */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-sm font-semibold text-foreground">
                Events
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  max 30
                </span>
              </p>
              {events.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {events.length} received
                </span>
              )}
            </div>
            <Card className="min-h-[320px]">
              <CardContent className="p-0 h-full">
                {/* Connecting */}
                {liveEnabled && !eventsConnected && (
                  <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                    Connecting...
                  </div>
                )}
                {/* Waiting */}
                {liveEnabled && eventsConnected && events.length === 0 && (
                  <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                    Waiting for events...
                  </div>
                )}
                {/* Idle placeholder */}
                {!liveEnabled && events.length === 0 && (
                  <div className="flex flex-col items-center justify-center min-h-[280px] gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      <Play className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Start live feed to see events
                    </p>
                  </div>
                )}
                {/* Events */}
                {events.length > 0 && (
                  <EventsFeed events={events} connected={eventsConnected} />
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right — Live Logs */}
          <div className="space-y-2">
            {/* Title + filters on same line */}
            <div className="flex items-center justify-between gap-2">
              <p className="text-sm font-semibold text-foreground shrink-0">
                Logs
                <span className="ml-2 text-xs font-normal text-muted-foreground">
                  max 100
                </span>
              </p>
              <div className="flex items-center gap-1">
                {(["all", "debug", "info", "warn", "error"] as LogLevel[]).map(
                  (lvl) => (
                    <button
                      key={lvl}
                      onClick={() => setLogLevel(lvl)}
                      className={cn(
                        "px-2 py-0.5 rounded text-xs font-medium transition-colors",
                        logLevel === lvl
                          ? "bg-brand/10 text-brand"
                          : "text-muted-foreground hover:text-foreground hover:bg-accent",
                      )}
                    >
                      {lvl === "all" ? "All" : LEVEL_CONFIG[lvl].label}
                      {lvl === "all" && logs.length > 0 && (
                        <span className="ml-1 opacity-60">{logs.length}</span>
                      )}
                      {lvl !== "all" && logCounts[lvl] > 0 && (
                        <span className={cn("ml-1", LEVEL_CONFIG[lvl].color)}>
                          {logCounts[lvl]}
                        </span>
                      )}
                    </button>
                  ),
                )}
              </div>
              {logs.length > 0 && (
                <span className="text-xs text-muted-foreground shrink-0">
                  {logs.length} received
                </span>
              )}
            </div>

            <Card className="min-h-[320px]">
              <CardContent className="p-0 h-full">
                {/* Connecting */}
                {liveEnabled && !logsConnected && (
                  <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                    Connecting...
                  </div>
                )}
                {/* Waiting */}
                {liveEnabled && logsConnected && filteredLogs.length === 0 && (
                  <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground font-mono">
                    <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                    {logLevel === "all"
                      ? "Waiting for logs..."
                      : `No ${logLevel} logs yet`}
                  </div>
                )}
                {/* Idle placeholder */}
                {!liveEnabled && filteredLogs.length === 0 && (
                  <div className="flex flex-col items-center justify-center min-h-[280px] gap-3">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      <ScrollText className="w-5 h-5 text-muted-foreground" />
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Start live feed to see logs
                    </p>
                  </div>
                )}
                {/* Logs */}
                {filteredLogs.map((log) => (
                  <LiveLogRow key={log.id} log={log} />
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
