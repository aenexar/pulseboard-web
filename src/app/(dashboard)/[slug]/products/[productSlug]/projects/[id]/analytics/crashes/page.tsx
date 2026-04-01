"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useCrashGroups } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function CrashesPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;
  const projectId = params?.id as string;

  const [page, setPage] = useState(1);
  const { data, isLoading } = useCrashGroups(
    slug,
    productSlug,
    projectId,
    page,
  );

  const base = `/${slug}/products/${productSlug}/projects/${projectId}`;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Crashes</h1>
          <p className="text-muted-foreground mt-1">
            {data?.total ?? 0} crash group{data?.total !== 1 ? "s" : ""}{" "}
            recorded
          </p>
        </div>
      </div>

      {/* Empty */}
      {data?.items.length === 0 && (
        <div
          className={cn(
            "flex items-center gap-3 p-6 rounded-lg",
            "bg-brand/10 border border-brand/20",
          )}
        >
          <CheckCircle2 className="w-5 h-5 text-brand shrink-0" />
          <p className="text-sm text-foreground font-medium">
            No crashes recorded — your app is crash-free!
          </p>
        </div>
      )}

      {/* List */}
      <div className="space-y-3">
        {data?.items.map((crash) => (
          <Link
            key={crash.id}
            href={`${base}/analytics/crashes/${crash.id}`}
            className="block"
          >
            <Card className="hover:border-brand/30 transition-colors cursor-pointer">
              <CardContent className="pt-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-semibold text-foreground">
                        {crash.errorName}
                      </span>
                      {crash.resolved ? (
                        <Badge
                          variant="outline"
                          className="text-brand border-brand/30 text-xs"
                        >
                          Resolved
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-destructive border-destructive/30 text-xs"
                        >
                          {crash.occurrences} occurrences
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">
                      {crash.errorMessage}
                    </p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>
                        First seen{" "}
                        {new Date(crash.firstSeenAt).toLocaleDateString()}
                      </span>
                      <span>
                        Last seen{" "}
                        {new Date(crash.lastSeenAt).toLocaleDateString()}
                      </span>
                      {crash.affectedUsers > 0 && (
                        <span>{crash.affectedUsers} affected users</span>
                      )}
                    </div>
                  </div>
                  <AlertTriangle
                    className={cn(
                      "w-5 h-5 shrink-0",
                      crash.resolved
                        ? "text-muted-foreground"
                        : "text-destructive",
                    )}
                  />
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {/* Pagination */}
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
