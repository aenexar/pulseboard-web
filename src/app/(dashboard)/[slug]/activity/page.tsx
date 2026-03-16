"use client";

import { OrgActivityItem } from "@/components/activity/activity-item";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useOrgActivity } from "@/hooks";
import { Activity } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ActivityPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [page, setPage] = useState(1);

  const { data, isLoading } = useOrgActivity(slug, page);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(8)].map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity</h1>
        <p className="text-muted-foreground mt-1">
          {data?.total ?? 0} event{data?.total !== 1 ? "s" : ""} recorded
        </p>
      </div>

      {data?.items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center border border-dashed border-border rounded-lg">
          <Activity className="w-10 h-10 text-muted-foreground/30 mb-3" />
          <p className="text-sm font-medium text-foreground">No activity yet</p>
          <p className="text-sm text-muted-foreground mt-1">
            Activity will appear here as your team uses PulseBoard
          </p>
        </div>
      )}

      {/* Timeline */}
      <div className="divide-y divide-border">
        {data?.items.map((item) => (
          <OrgActivityItem key={item.id} item={item} />
        ))}
      </div>

      {/* Pagination */}
      {(data?.hasMore || page > 1) && (
        <div className="flex items-center justify-between pt-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p - 1)}
            disabled={page === 1}
          >
            Previous
          </Button>
          <span className="text-sm text-muted-foreground">Page {page}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={!data?.hasMore}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
