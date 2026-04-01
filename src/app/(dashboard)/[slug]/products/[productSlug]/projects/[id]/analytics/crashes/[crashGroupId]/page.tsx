"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCrashGroup, useResolveCrashGroup } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Monitor,
  RefreshCw,
  Smartphone,
  User,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

// ─── Stack trace viewer ───────────────────────────────────────────────────────

function StackTrace({ trace }: { trace: string }) {
  const [expanded, setExpanded] = useState(false);
  const lines = trace.split("\n");
  const preview = lines.slice(0, 5);
  const hasMore = lines.length > 5;

  return (
    <div className="space-y-2">
      <pre className="text-xs font-mono text-muted-foreground bg-muted p-3 rounded-lg overflow-x-auto leading-relaxed">
        {expanded ? trace : preview.join("\n")}
        {!expanded && hasMore && "\n..."}
      </pre>
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
        >
          {expanded ? (
            <>
              <ChevronUp className="w-3 h-3" />
              Show less
            </>
          ) : (
            <>
              <ChevronDown className="w-3 h-3" />
              Show {lines.length - 5} more lines
            </>
          )}
        </button>
      )}
    </div>
  );
}

// ─── Event row ────────────────────────────────────────────────────────────────

function EventRow({
  event,
}: {
  event: {
    id: string;
    timestamp: string;
    platform: string | null;
    os: string | null;
    osVersion: string | null;
    deviceModel: string | null;
    appVersion: string | null;
    isFatal: boolean | null;
    stackTrace: string | null;
    errorMessage: string | null;
    userId: string | null;
    environment: string | null;
  };
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="border-b border-border last:border-0">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-accent/50 transition-colors"
      >
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            {event.isFatal && (
              <Badge
                variant="outline"
                className="text-destructive border-destructive/30 text-xs"
              >
                Fatal
              </Badge>
            )}
            <span className="text-xs text-muted-foreground font-mono">
              {new Date(event.timestamp).toLocaleString()}
            </span>
            {event.appVersion && (
              <span className="text-xs text-muted-foreground">
                v{event.appVersion}
              </span>
            )}
            {event.environment && (
              <Badge variant="outline" className="text-xs">
                {event.environment}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
            {event.deviceModel && (
              <span className="flex items-center gap-1">
                <Smartphone className="w-3 h-3" />
                {event.deviceModel}
              </span>
            )}
            {event.os && (
              <span className="flex items-center gap-1">
                <Monitor className="w-3 h-3" />
                {event.os} {event.osVersion}
              </span>
            )}
            {event.userId && (
              <span className="flex items-center gap-1">
                <User className="w-3 h-3" />
                {event.userId}
              </span>
            )}
          </div>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-muted-foreground shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-muted-foreground shrink-0" />
        )}
      </button>

      {expanded && event.stackTrace && (
        <div className="px-4 pb-4">
          <StackTrace trace={event.stackTrace} />
        </div>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CrashDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;
  const projectId = params?.id as string;
  const crashGroupId = params?.crashGroupId as string;

  const { data, isLoading } = useCrashGroup(
    slug,
    productSlug,
    projectId,
    crashGroupId,
  );
  const { resolve, unresolve } = useResolveCrashGroup(
    slug,
    productSlug,
    projectId,
    crashGroupId,
  );

  const backHref = `/${slug}/products/${productSlug}/projects/${projectId}/analytics/crashes`;

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
    return <p className="text-muted-foreground">Crash group not found.</p>;
  }

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        href={backHref}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Crashes
      </Link>

      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-bold text-foreground">
              {data.errorName}
            </h1>
            {data.resolved ? (
              <Badge variant="outline" className="text-brand border-brand/30">
                Resolved
              </Badge>
            ) : (
              <Badge
                variant="outline"
                className="text-destructive border-destructive/30"
              >
                {data.occurrences} occurrences
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            {data.errorMessage}
          </p>
        </div>

        {data.resolved ? (
          <Button
            variant="outline"
            size="sm"
            onClick={() => unresolve.mutate()}
            disabled={unresolve.isPending}
            className="gap-2 shrink-0"
          >
            <RefreshCw
              className={cn("w-4 h-4", unresolve.isPending && "animate-spin")}
            />
            Reopen
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => resolve.mutate()}
            disabled={resolve.isPending}
            className="gap-2 text-brand border-brand/30 hover:bg-brand/10 shrink-0"
          >
            <CheckCircle2 className="w-4 h-4" />
            {resolve.isPending ? "Resolving..." : "Mark Resolved"}
          </Button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Occurrences", value: data.occurrences.toLocaleString() },
          {
            label: "Affected Users",
            value: data.affectedUsers.toLocaleString(),
          },
          {
            label: "First Seen",
            value: new Date(data.firstSeenAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
          },
          {
            label: "Last Seen",
            value: new Date(data.lastSeenAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            }),
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

      {/* Recent occurrences */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">
              Recent Occurrences
            </CardTitle>
            <span className="text-xs text-muted-foreground">
              {data.events.length} shown
            </span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {data.events.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No event data available
            </p>
          ) : (
            data.events.map((event) => (
              <EventRow key={event.id} event={event} />
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
