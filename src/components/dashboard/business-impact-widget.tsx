"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBusinessImpact } from "@/hooks";
import { cn } from "@/lib/utils";
import { ArrowDown, ArrowUp, DollarSign, Minus } from "lucide-react";

function TrendIcon({
  trend,
}: {
  trend?: "improving" | "worsening" | "stable";
}) {
  if (trend === "improving")
    return <ArrowDown className="w-3.5 h-3.5 text-brand" />;
  if (trend === "worsening")
    return <ArrowUp className="w-3.5 h-3.5 text-destructive" />;
  return <Minus className="w-3.5 h-3.5 text-muted-foreground" />;
}

export function BusinessImpactWidget({
  slug,
  productSlug,
  projectId,
}: {
  slug: string;
  productSlug: string;
  projectId: string;
}) {
  const { data, isLoading } = useBusinessImpact(slug, productSlug, projectId);

  if (isLoading || !data || data.totalSessions === 0) return null;

  const trendColor =
    data.trend === "improving"
      ? "text-brand"
      : data.trend === "worsening"
        ? "text-destructive"
        : "text-muted-foreground";

  return (
    <Card className="border-dashed">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
          <DollarSign className="w-4 h-4" />
          Business Impact — last 7 days
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-muted-foreground">Crash rate</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <p className={cn("text-lg font-bold", trendColor)}>
                {data.crashRate.toFixed(2)}%
              </p>
              <TrendIcon trend={data.trend} />
            </div>
            {data.comparisonCrashRate !== undefined && (
              <p className="text-[10px] text-muted-foreground">
                vs {data.comparisonCrashRate.toFixed(2)}% prior week
              </p>
            )}
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Crashed sessions</p>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {data.crashedSessions.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">
              of {data.totalSessions.toLocaleString()} total
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Est. lost sessions</p>
            <p className="text-lg font-bold text-foreground mt-0.5">
              {data.estimatedLostSessions.toLocaleString()}
            </p>
            <p className="text-[10px] text-muted-foreground">
              40% churn estimate
            </p>
          </div>

          <div>
            <p className="text-xs text-muted-foreground">Est. revenue impact</p>
            <p
              className={cn(
                "text-lg font-bold mt-0.5",
                data.estimatedRevenueLoss > 0
                  ? "text-destructive"
                  : "text-brand",
              )}
            >
              {data.estimatedRevenueLoss > 0
                ? `-$${data.estimatedRevenueLoss.toFixed(2)}`
                : "$0.00"}
            </p>
            <p className="text-[10px] text-muted-foreground">
              @ ${data.sessionValueUsd}/session
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
