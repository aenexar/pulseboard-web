"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useScreens } from "@/hooks";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Monitor } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

function formatMs(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(1)}s`;
  return `${ms}ms`;
}

function loadColor(ms: number) {
  if (ms === 0) return "text-muted-foreground";
  if (ms < 500) return "text-brand";
  if (ms < 1500) return "text-yellow-500";
  return "text-destructive";
}

export default function ScreensPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;
  const projectId = params?.id as string;

  const [page, setPage] = useState(1);
  const { data, isLoading } = useScreens(slug, productSlug, projectId, page);

  const base = `/${slug}/products/${productSlug}/projects/${projectId}`;
  const maxLoad = Math.max(
    ...(data?.items.map((s) => s.avgLoadTime) ?? [1]),
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
        <h1 className="text-2xl font-bold text-foreground">
          Screen Performance
        </h1>
        <p className="text-muted-foreground mt-1">
          {data?.total ?? 0} screen{data?.total !== 1 ? "s" : ""} tracked
        </p>
      </div>

      {data?.items.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No screen view data recorded yet.
        </p>
      )}

      <div className="space-y-3">
        {data?.items.map((s) => (
          <Link
            key={s.screenName}
            href={`${base}/analytics/screens/${encodeURIComponent(s.screenName)}`}
            className="block"
          >
            <Card className="hover:border-brand/30 transition-colors cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Monitor className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {s.screenName}
                      </p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{s.views.toLocaleString()} views</span>
                        {s.avgTimeSpent > 0 && (
                          <span>{formatMs(s.avgTimeSpent)} avg time spent</span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Load time bar */}
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-36">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        loadColor(s.avgLoadTime),
                      )}
                    >
                      {s.avgLoadTime > 0 ? formatMs(s.avgLoadTime) : "—"} avg
                      load
                    </span>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          s.avgLoadTime < 500
                            ? "bg-brand"
                            : s.avgLoadTime < 1500
                              ? "bg-yellow-500"
                              : "bg-destructive",
                        )}
                        style={{
                          width: `${Math.round((s.avgLoadTime / maxLoad) * 100)}%`,
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
