"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAIActivity } from "@/hooks";
import { cn } from "@/lib/utils";
import { AIActivity } from "@/types";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Cpu,
  DollarSign,
  Zap,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

// ─── Helpers ─────────────────────────────────────────────────────────────────

const ACTION_LABELS: Record<string, string> = {
  generate_insights: "Generate Insights",
  explain_insight: "Explain Insight",
  compare_insights: "Compare Insights",
  weekly_digest: "Weekly Digest",
  product_synthesis: "Product Synthesis",
  org_synthesis: "Org Synthesis",
};

const PROVIDER_COLORS: Record<string, string> = {
  anthropic: "text-orange-500  border-orange-500/30  bg-orange-500/10",
  openai: "text-green-500   border-green-500/30   bg-green-500/10",
  google: "text-blue-500    border-blue-500/30    bg-blue-500/10",
  moonshot: "text-purple-500  border-purple-500/30  bg-purple-500/10",
};

function formatDuration(ms: number | null): string {
  if (!ms) return "—";
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

function formatCost(usd: number | null): string {
  if (!usd) return "—";
  if (usd < 0.01) return `$${(usd * 100).toFixed(3)}¢`;
  return `$${usd.toFixed(4)}`;
}

// ─── Activity row ─────────────────────────────────────────────────────────────

function ActivityRow({ item }: { item: AIActivity }) {
  return (
    <div className="flex items-center gap-4 py-3 border-b border-border last:border-0">
      {/* Status icon */}
      {item.status === "success" ? (
        <CheckCircle2 className="w-4 h-4 text-brand shrink-0" />
      ) : (
        <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
      )}

      {/* Action + model */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium text-foreground">
            {ACTION_LABELS[item.action] ?? item.action}
          </span>
          <Badge
            variant="outline"
            className={cn("text-xs", PROVIDER_COLORS[item.provider])}
          >
            {item.model}
          </Badge>
          {item.status === "failed" && (
            <Badge
              variant="outline"
              className="text-xs text-destructive border-destructive/30"
            >
              Failed
            </Badge>
          )}
        </div>
        {item.error && (
          <p className="text-xs text-destructive mt-0.5 truncate">
            {item.error}
          </p>
        )}
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(item.createdAt).toLocaleString("en-US", {
              month: "short",
              day: "numeric",
              hour: "numeric",
              minute: "2-digit",
            })}
          </span>
          {item.durationMs && (
            <span className="flex items-center gap-1">
              <Zap className="w-3 h-3" />
              {formatDuration(item.durationMs)}
            </span>
          )}
          {item.tokensUsed && (
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3" />
              {item.tokensUsed.toLocaleString()} tokens
            </span>
          )}
          {item.estimatedCost != null && item.estimatedCost > 0 && (
            <span className="flex items-center gap-1">
              <DollarSign className="w-3 h-3" />
              {formatCost(item.estimatedCost)}
            </span>
          )}
        </div>
      </div>

      {/* Triggered by */}
      {item.triggeredBy ? (
        <div className="flex items-center gap-1.5 shrink-0">
          <Avatar className="w-5 h-5">
            <AvatarImage src={item.triggeredBy.avatarUrl ?? undefined} />
            <AvatarFallback className="text-[8px] bg-brand/10 text-brand">
              {item.triggeredBy.name.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground hidden sm:block">
            {item.triggeredBy.name}
          </span>
        </div>
      ) : (
        <span className="text-xs text-muted-foreground shrink-0">
          Scheduled
        </span>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AIActivityPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [page, setPage] = useState(1);
  const { data, isLoading } = useAIActivity(slug, page);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Bot className="w-6 h-6 text-brand" />
          AI Activity
        </h1>
        <p className="text-muted-foreground mt-1">
          Every action taken with your API key — tokens used, cost, and duration
        </p>
      </div>

      {/* Summary cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : (
        data && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Total API calls</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  {data.totals.calls.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Tokens used</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  {data.totals.tokensUsed.toLocaleString()}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-xs text-muted-foreground">Estimated cost</p>
                <p className="text-2xl font-bold text-foreground mt-0.5">
                  ${data.totals.estimatedCost.toFixed(4)}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Based on published pricing
                </p>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Activity list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold text-foreground">
            Activity Log
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 px-6">
          {isLoading && (
            <div className="space-y-3 py-4">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
          )}

          {!isLoading && data?.items.length === 0 && (
            <div className="flex flex-col items-center justify-center py-16 gap-3">
              <Bot className="w-10 h-10 text-muted-foreground/30" />
              <p className="text-sm text-muted-foreground">
                No AI activity yet — generate your first insights to see
                activity here
              </p>
            </div>
          )}

          {!isLoading &&
            data?.items.map((item) => (
              <ActivityRow key={item.id} item={item} />
            ))}
        </CardContent>
      </Card>

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

      {/* Transparency note */}
      <p className="text-xs text-muted-foreground text-center pb-4">
        Cost estimates are calculated from published token pricing and are
        approximate. Check your AI provider dashboard for exact billing.
      </p>
    </div>
  );
}
