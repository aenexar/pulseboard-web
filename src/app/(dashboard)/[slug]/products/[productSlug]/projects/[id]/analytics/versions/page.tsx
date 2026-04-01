"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useVersions } from "@/hooks";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Tag } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

function crashRateColor(rate: number) {
  if (rate === 0) return "text-brand";
  if (rate < 2) return "text-yellow-500";
  return "text-destructive";
}

export default function VersionsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;
  const projectId = params?.id as string;

  const [page, setPage] = useState(1);
  const { data, isLoading } = useVersions(slug, productSlug, projectId, page);

  const base = `/${slug}/products/${productSlug}/projects/${projectId}`;

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
        <h1 className="text-2xl font-bold text-foreground">Versions</h1>
        <p className="text-muted-foreground mt-1">
          {data?.total ?? 0} app version{data?.total !== 1 ? "s" : ""} detected
        </p>
      </div>

      {data?.items.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No version data recorded yet.
        </p>
      )}

      <div className="space-y-3">
        {data?.items.map((v) => (
          <Link
            key={v.appVersion}
            href={`${base}/analytics/versions/${encodeURIComponent(v.appVersion)}`}
            className="block"
          >
            <Card className="hover:border-brand/30 transition-colors cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <Tag className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-foreground font-mono">
                          v{v.appVersion}
                        </span>
                        <Badge
                          variant="outline"
                          className={cn("text-xs", crashRateColor(v.crashRate))}
                        >
                          {v.crashRate.toFixed(2)}% crash rate
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{v.totalSessions.toLocaleString()} sessions</span>
                        <span>{v.crashes} crashes</span>
                        <span>
                          {new Date(v.firstSeenAt).toLocaleDateString()} →{" "}
                          {new Date(v.lastSeenAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Crash rate bar */}
                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-32">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        crashRateColor(v.crashRate),
                      )}
                    >
                      {v.crashRate.toFixed(2)}%
                    </span>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          v.crashRate === 0
                            ? "bg-brand"
                            : v.crashRate < 2
                              ? "bg-yellow-500"
                              : "bg-destructive",
                        )}
                        style={{ width: `${Math.min(v.crashRate * 5, 100)}%` }}
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
