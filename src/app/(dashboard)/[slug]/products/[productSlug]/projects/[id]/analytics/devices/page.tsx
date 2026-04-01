"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useDevices } from "@/hooks";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

function PlatformIcon({ platform }: { platform: string }) {
  if (platform === "android" || platform === "ios") {
    return <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />;
  }
  return <Monitor className="w-4 h-4 text-muted-foreground shrink-0" />;
}

function crashRateColor(rate: number) {
  if (rate === 0) return "text-brand";
  if (rate < 2) return "text-yellow-500";
  return "text-destructive";
}

export default function DevicesPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;
  const projectId = params?.id as string;

  const [page, setPage] = useState(1);
  const { data, isLoading } = useDevices(slug, productSlug, projectId, page);

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
        <h1 className="text-2xl font-bold text-foreground">Devices</h1>
        <p className="text-muted-foreground mt-1">
          {data?.total ?? 0} device model{data?.total !== 1 ? "s" : ""} detected
        </p>
      </div>

      {data?.items.length === 0 && (
        <p className="text-sm text-muted-foreground py-8 text-center">
          No device data recorded yet.
        </p>
      )}

      <div className="space-y-3">
        {data?.items.map((d) => (
          <Link
            key={d.deviceModel}
            href={`${base}/analytics/devices/${encodeURIComponent(d.deviceModel)}`}
            className="block"
          >
            <Card className="hover:border-brand/30 transition-colors cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <PlatformIcon platform={d.platform} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground">
                          {d.deviceModel}
                        </span>
                        {d.manufacturer !== "unknown" && (
                          <span className="text-xs text-muted-foreground">
                            {d.manufacturer}
                          </span>
                        )}
                        <Badge
                          variant="outline"
                          className={cn("text-xs", crashRateColor(d.crashRate))}
                        >
                          {d.crashRate.toFixed(2)}% crash rate
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                        <span>{d.totalEvents.toLocaleString()} events</span>
                        <span>{d.crashes} crashes</span>
                        <span className="capitalize">{d.platform}</span>
                      </div>
                    </div>
                  </div>

                  <div className="hidden sm:flex flex-col items-end gap-1 shrink-0 w-32">
                    <span
                      className={cn(
                        "text-xs font-medium",
                        crashRateColor(d.crashRate),
                      )}
                    >
                      {d.crashRate.toFixed(2)}%
                    </span>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          d.crashRate === 0
                            ? "bg-brand"
                            : d.crashRate < 2
                              ? "bg-yellow-500"
                              : "bg-destructive",
                        )}
                        style={{ width: `${Math.min(d.crashRate * 5, 100)}%` }}
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
