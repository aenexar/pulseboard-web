"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useApiEndpoints } from "@/hooks";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Globe } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function methodColor(method: string) {
  switch (method.toUpperCase()) {
    case "GET":
      return "text-brand    border-brand/30    bg-brand/10";
    case "POST":
      return "text-blue-500 border-blue-500/30 bg-blue-500/10";
    case "PUT":
      return "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
    case "PATCH":
      return "text-yellow-500 border-yellow-500/30 bg-yellow-500/10";
    case "DELETE":
      return "text-destructive border-destructive/30 bg-destructive/10";
    default:
      return "text-muted-foreground border-border";
  }
}

function durationColor(ms: number) {
  if (ms < 200) return "text-brand";
  if (ms < 1000) return "text-yellow-500";
  return "text-destructive";
}

export default function ApiPerformancePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;
  const projectId = params?.id as string;

  const [page, setPage] = useState(1);
  const { data, isLoading } = useApiEndpoints(
    slug,
    productSlug,
    projectId,
    page,
  );

  const base = `/${slug}/products/${productSlug}/projects/${projectId}`;
  const maxDuration = Math.max(
    ...(data?.items.map((e) => e.avgDuration) ?? [1]),
    1,
  );

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">API Performance</h1>
        <p className="text-muted-foreground mt-1">
          {data?.total ?? 0} endpoint{data?.total !== 1 ? "s" : ""} tracked
        </p>
      </div>

      {data?.items.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No API call data recorded yet.
        </p>
      )}

      <div className="space-y-3">
        {data?.items.map((e) => (
          <Link
            key={`${e.httpMethod}-${e.endpoint}`}
            href={`${base}/analytics/api/${encodeURIComponent(e.endpoint)}?method=${e.httpMethod}`}
            className="block"
          >
            <Card className="hover:border-brand/30 transition-colors cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-start gap-3 min-w-0">
                    <Globe className="w-4 h-4 text-muted-foreground shrink-0 mt-0.5" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-xs font-mono",
                            methodColor(e.httpMethod),
                          )}
                        >
                          {e.httpMethod}
                        </Badge>
                        <span className="text-sm font-semibold text-foreground font-mono truncate">
                          {e.endpoint}
                        </span>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{e.totalCalls.toLocaleString()} calls</span>
                        {e.failureRate > 0 && (
                          <span className="text-destructive">
                            {e.failureRate.toFixed(1)}% failure rate
                          </span>
                        )}
                        <span className={cn(durationColor(e.avgDuration))}>
                          {formatMs(e.avgDuration)} avg
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Duration bar */}
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-36">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        durationColor(e.avgDuration),
                      )}
                    >
                      {formatMs(e.avgDuration)}
                    </span>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          e.avgDuration < 200
                            ? "bg-brand"
                            : e.avgDuration < 1000
                              ? "bg-yellow-500"
                              : "bg-destructive",
                        )}
                        style={{
                          width: `${Math.round((e.avgDuration / maxDuration) * 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {data && (data.hasMore || page > 1) && (
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
            Page {page} · {data.total} total
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data.hasMore}
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
