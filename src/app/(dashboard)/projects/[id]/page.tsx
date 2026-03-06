"use client";

import { EventsFeed } from "@/components/dashboard/events-feed";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks";
import { useRealtimeEvents } from "@/hooks/useRealtimeEvents";
import { cn } from "@/lib/utils";
import { Copy, Play, Settings, Square, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useState } from "react";

export default function ProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = React.use(params);

  const { data: project, isLoading } = useProject(id);
  const { events, connected, enabled, start, stop, clearEvents } =
    useRealtimeEvents(id);
  const [copied, setCopied] = useState(false);

  const copyApiKey = () => {
    if (!project) return;
    navigator.clipboard.writeText(project.apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-24" />
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
        <div>
          <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
          <p className="text-muted-foreground mt-1">
            {project._count?.events ?? 0} total events
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href={`/projects/${id}/settings`}>
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

        {/* Idle state */}
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
