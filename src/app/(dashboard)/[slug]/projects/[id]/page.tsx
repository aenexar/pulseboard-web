"use client";

import { EventsFeed } from "@/components/dashboard/events-feed";
import { StatsCard } from "@/components/dashboard/stats-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject, useProducts, useProjectStats } from "@/hooks";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import { cn } from "@/lib/utils";
import { Framework, FRAMEWORK_LABELS } from "@/types";
import {
  Activity,
  AlertTriangle,
  Clock,
  Copy,
  Play,
  Settings,
  Square,
  Timer,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ProjectPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = params?.id as string;

  const { data: products } = useProducts(slug);
  const productSlug = products?.[0]?.slug ?? "";
  const { data: project, isLoading } = useProject(slug, productSlug, id);
  const { data: stats, isLoading: statsLoading } = useProjectStats(
    slug,
    productSlug,
    id,
  );
  const { events, connected, enabled, start, stop, clearEvents } =
    useRealtimeEvents(id);
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    if (!project) return;
    navigator.clipboard.writeText(project.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

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
          <Link href={`/${slug}/projects/${id}/settings`}>
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

      {/* Stats Cards */}
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

      {/* Live Events Feed */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-foreground">
              Live Events
            </h2>
            {connected && (
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                <span className="text-xs text-muted-foreground font-mono">
                  live
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {enabled && (
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
                onClick={clearEvents}
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Clear
              </Button>
            )}
            <Button
              size="sm"
              onClick={enabled ? stop : start}
              className={cn(
                "gap-2 font-medium",
                enabled
                  ? "bg-destructive/10 text-destructive hover:bg-destructive/20 border border-destructive/20"
                  : "bg-brand/10 text-brand hover:bg-brand/20 border border-brand/20",
              )}
              variant="ghost"
            >
              {enabled ? (
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

        {!enabled && (
          <div
            className={cn(
              "flex flex-col items-center justify-center py-16 gap-4 rounded-lg",
              "border border-dashed border-border",
            )}
          >
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
              <Play className="w-5 h-5 text-muted-foreground" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-foreground">
                Live feed is paused
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Click Start Live Feed to begin receiving real-time events
              </p>
            </div>
          </div>
        )}

        {enabled && <EventsFeed events={events} connected={connected} />}
      </div>
    </div>
  );
}
