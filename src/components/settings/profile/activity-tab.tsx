import { UserActivityItem } from "@/components/activity/activity-item";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserActivity } from "@/hooks";
import { useState } from "react";

export function ActivityTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserActivity(page);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Activity</CardTitle>
          <CardDescription>
            A log of all actions taken on your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {data?.items.map((item) => (
                <UserActivityItem key={item.id} item={item} />
              ))}
            </div>
          )}

          {(data?.hasMore || page > 1) && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
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
        </CardContent>
      </Card>
    </div>
  );
}
