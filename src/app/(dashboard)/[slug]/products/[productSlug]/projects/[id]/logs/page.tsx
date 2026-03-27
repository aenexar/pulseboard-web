"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useLogs, useLogStats, useRealtimeLogs } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  Bug,
  ChevronLeft,
  ChevronRight,
  Info,
  Play,
  ScrollText,
  Search,
  Square,
  Trash2,
  X,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

// ─── Level config ─────────────────────────────────────────────────────────────

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

// ─── Log row ──────────────────────────────────────────────────────────────────

function LogRow({
  item,
  isLive = false,
}: {
  item: {
    id: string;
    level: keyof typeof LEVEL_CONFIG;
    message: string;
    meta: Record<string, unknown> | null;
    sessionId: string | null;
    appVersion: string | null;
    timestamp: string;
  };
  isLive?: boolean;
}) {
  const [expanded, setExpanded] = useState(false);
  const config = LEVEL_CONFIG[item.level] ?? LEVEL_CONFIG.info;
  const Icon = config.icon;

  return (
    <div
      className={cn(
        "font-mono text-xs border-b border-border last:border-0 cursor-pointer hover:bg-accent/50 transition-colors",
        isLive && "animate-in fade-in slide-in-from-top-1 duration-200",
      )}
      onClick={() => setExpanded(!expanded)}
    >
      <div className="flex items-start gap-3 px-4 py-2">
        {/* Level badge */}
        <div
          className={cn(
            "flex items-center gap-1 shrink-0 px-1.5 py-0.5 rounded text-xs font-semibold w-14 justify-center",
            config.bg,
            config.color,
          )}
        >
          <Icon className="w-3 h-3" />
          {config.label}
        </div>

        {/* Timestamp */}
        <span className="text-muted-foreground shrink-0 w-32">
          {new Date(item.timestamp).toLocaleTimeString()}
        </span>

        {/* Message */}
        <span
          className={cn(
            "flex-1 truncate",
            expanded && "whitespace-pre-wrap break-all",
            config.color,
          )}
        >
          {item.message}
        </span>

        {/* Version */}
        {item.appVersion && (
          <span className="text-muted-foreground shrink-0">
            v{item.appVersion}
          </span>
        )}

        {/* Live indicator */}
        {isLive && (
          <span className="text-brand text-[10px] font-semibold shrink-0">
            LIVE
          </span>
        )}
      </div>

      {expanded && item.meta && (
        <div className="px-4 pb-3 ml-[4.5rem]">
          <pre className="text-xs text-muted-foreground bg-muted p-3 rounded-md overflow-auto max-h-48">
            {JSON.stringify(item.meta, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LogsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = params?.id as string;
  const productSlug = params?.productSlug as string;

  const [level, setLevel] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [query, setQuery] = useState<string>("");
  const [page, setPage] = useState(1);

  const { data: stats } = useLogStats(slug, productSlug, id);
  const { data: logs, isLoading } = useLogs(slug, productSlug, id, {
    level: level || undefined,
    search: query || undefined,
    page,
  });

  const {
    logs: liveLogs,
    connected,
    enabled: liveEnabled,
    start: startLive,
    stop: stopLive,
    clearLogs: clearLive,
  } = useRealtimeLogs(id);

  const handleSearch = () => {
    setQuery(search);
    setPage(1);
  };
  const handleClear = () => {
    setSearch("");
    setQuery("");
    setLevel("");
    setPage(1);
  };

  if (!productSlug) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Logs</h1>
          <p className="text-muted-foreground mt-1">
            Console and application logs from your project
          </p>
        </div>

        {/* Live toggle */}
        <div className="flex items-center gap-2">
          {liveEnabled && (
            <>
              {connected && (
                <div className="flex items-center gap-1.5">
                  <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                  <span className="text-xs text-muted-foreground font-mono">
                    live
                  </span>
                </div>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={clearLive}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            </>
          )}
          <Button
            size="sm"
            onClick={liveEnabled ? stopLive : startLive}
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
                <Square className="w-3.5 h-3.5 fill-current" /> Stop Live
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" /> Live Logs
              </>
            )}
          </Button>
        </div>
      </div>

      {/* Live feed */}
      {liveEnabled && (
        <Card>
          <CardContent className="p-0">
            {!connected && (
              <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-muted-foreground animate-pulse" />
                Connecting...
              </div>
            )}
            {connected && liveLogs.length === 0 && (
              <div className="flex items-center gap-2 px-4 py-3 text-xs text-muted-foreground font-mono">
                <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                Waiting for logs...
              </div>
            )}
            {liveLogs.map((log) => (
              <LogRow key={log.id} item={log} isLive />
            ))}
          </CardContent>
        </Card>
      )}

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-4 gap-3">
          {(
            Object.entries(LEVEL_CONFIG) as [
              keyof typeof LEVEL_CONFIG,
              (typeof LEVEL_CONFIG)[keyof typeof LEVEL_CONFIG],
            ][]
          ).map(([lvl, config]) => (
            <button
              key={lvl}
              onClick={() => {
                setLevel(lvl);
                setPage(1);
              }}
              className={cn(
                "flex items-center justify-between p-3 rounded-lg border transition-colors text-left",
                "border-border bg-card hover:border-brand/30",
                level === lvl && "border-brand/50 bg-brand/5",
              )}
            >
              <span className="text-xs text-muted-foreground capitalize">
                {config.label}
              </span>
              <span className={cn("text-lg font-bold", config.color)}>
                {stats[lvl]}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={level || "all"}
          onValueChange={(v) => {
            setLevel(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue placeholder="All levels" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All levels</SelectItem>
            <SelectItem value="debug">Debug</SelectItem>
            <SelectItem value="info">Info</SelectItem>
            <SelectItem value="warn">Warn</SelectItem>
            <SelectItem value="error">Error</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2 flex-1">
          <Input
            placeholder="Search logs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            className="font-mono text-sm"
          />
          <Button variant="outline" size="icon" onClick={handleSearch}>
            <Search className="w-4 h-4" />
          </Button>
          {(query || level) && (
            <Button variant="ghost" size="icon" onClick={handleClear}>
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Historical log list */}
      <Card>
        <CardContent className="p-0">
          {isLoading && (
            <div className="space-y-px p-4">
              {[...Array(8)].map((_, i) => (
                <Skeleton key={i} className="h-8" />
              ))}
            </div>
          )}

          {!isLoading && logs?.items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <ScrollText className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">No logs found</p>
              {(query || level) && (
                <Button variant="outline" size="sm" onClick={handleClear}>
                  Clear filters
                </Button>
              )}
            </div>
          )}

          {!isLoading &&
            logs?.items.map((item) => <LogRow key={item.id} item={item} />)}
        </CardContent>
      </Card>

      {/* Pagination */}
      {logs && (logs.hasMore || page > 1) && (
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">
            Page {page} · {logs.total} total
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!logs.hasMore}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
