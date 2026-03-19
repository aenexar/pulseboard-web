"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useFeedback,
  useFeedbackStats,
  useProducts,
  useUpdateFeedbackStatus,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Bug,
  ChevronLeft,
  ChevronRight,
  Lightbulb,
  MessageSquare,
  User,
} from "lucide-react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { useState } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  bug: {
    label: "Bug",
    icon: Bug,
    color: "text-destructive",
    bg: "bg-destructive/10",
  },
  feature: {
    label: "Feature",
    icon: Lightbulb,
    color: "text-brand",
    bg: "bg-brand/10",
  },
  general: {
    label: "General",
    icon: MessageSquare,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
  },
};

const STATUS_CONFIG = {
  open: {
    label: "Open",
    className: "border-yellow-500/30 bg-yellow-500/10 text-yellow-600",
  },
  in_progress: {
    label: "In Progress",
    className: "border-blue-500/30 bg-blue-500/10 text-blue-500",
  },
  resolved: {
    label: "Resolved",
    className: "border-brand/30 bg-brand/10 text-brand",
  },
  dismissed: {
    label: "Dismissed",
    className: "border-border bg-muted text-muted-foreground",
  },
};

// ─── Feedback Card ────────────────────────────────────────────────────────────

function FeedbackCard({
  item,
  slug,
  productSlug,
  projectId,
}: {
  item: {
    id: string;
    type: keyof typeof TYPE_CONFIG;
    status: keyof typeof STATUS_CONFIG;
    message: string;
    userEmail: string | null;
    userName: string | null;
    appVersion: string | null;
    screenshotUrl: string | null;
    createdAt: string;
  };
  slug: string;
  productSlug: string;
  projectId: string;
}) {
  const typeConfig = TYPE_CONFIG[item.type];
  const statusConfig = STATUS_CONFIG[item.status];
  const TypeIcon = typeConfig.icon;
  const updateStatus = useUpdateFeedbackStatus(slug, productSlug, projectId);

  const [screenshotOpen, setScreenshotOpen] = useState(false);

  return (
    <>
      <div className="flex items-start gap-4 p-4 rounded-xl border border-border bg-card">
        {/* Type icon */}
        <div
          className={cn(
            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
            typeConfig.bg,
          )}
        >
          <TypeIcon className={cn("w-4 h-4", typeConfig.color)} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm text-foreground leading-snug">
              {item.message}
            </p>
            <Badge
              variant="outline"
              className={cn("text-xs shrink-0", statusConfig.className)}
            >
              {statusConfig.label}
            </Badge>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* User */}
            {(item.userName || item.userEmail) && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <User className="w-3 h-3" />
                {item.userName ?? item.userEmail}
              </div>
            )}

            {/* Version */}
            {item.appVersion && (
              <span className="text-xs text-muted-foreground">
                v{item.appVersion}
              </span>
            )}

            {/* Type badge */}
            <Badge
              variant="outline"
              className={cn("text-xs", typeConfig.color)}
            >
              {typeConfig.label}
            </Badge>

            {/* Time */}
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(item.createdAt), {
                addSuffix: true,
              })}
            </span>

            {/* Screenshot */}
            {item.screenshotUrl && (
              <button
                onClick={() => setScreenshotOpen(true)}
                className="text-xs text-brand hover:underline"
              >
                View screenshot
              </button>
            )}
          </div>
        </div>

        {/* Status control */}
        <Select
          value={item.status}
          onValueChange={(status) =>
            updateStatus.mutate({
              feedbackId: item.id,
              status: status as keyof typeof STATUS_CONFIG,
            })
          }
        >
          <SelectTrigger className="h-8 w-32 text-xs shrink-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Screenshot dialog */}
      {item.screenshotUrl && (
        <Dialog open={screenshotOpen} onOpenChange={setScreenshotOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Screenshot</DialogTitle>
            </DialogHeader>
            <div className="relative w-full aspect-[9/16] rounded-lg overflow-hidden border border-border">
              <Image
                src={item.screenshotUrl}
                alt="Feedback screenshot"
                fill
                className="object-contain"
              />
            </div>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = params?.id as string;

  const { data: products } = useProducts(slug);
  const productSlug = products?.[0]?.slug ?? "";

  const [type, setType] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);

  const { data: stats } = useFeedbackStats(slug, productSlug, id);
  const { data, isLoading } = useFeedback(slug, productSlug, id, {
    type: type || undefined,
    status: status || undefined,
    page,
  });

  if (!productSlug) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Feedback</h1>
        <p className="text-muted-foreground mt-1">
          User feedback and bug reports from your app
        </p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 gap-4">
          {/* By type */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-3">By Type</p>
              <div className="space-y-2">
                {(
                  Object.entries(TYPE_CONFIG) as [
                    keyof typeof TYPE_CONFIG,
                    (typeof TYPE_CONFIG)[keyof typeof TYPE_CONFIG],
                  ][]
                ).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setType(key);
                      setPage(1);
                    }}
                    className="flex items-center justify-between w-full hover:opacity-80 transition-opacity"
                  >
                    <div className="flex items-center gap-2">
                      <config.icon
                        className={cn("w-3.5 h-3.5", config.color)}
                      />
                      <span className="text-sm text-foreground">
                        {config.label}
                      </span>
                    </div>
                    <span className={cn("text-sm font-semibold", config.color)}>
                      {stats.byType[key]}
                    </span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* By status */}
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground mb-3">By Status</p>
              <div className="space-y-2">
                {(
                  Object.entries(STATUS_CONFIG) as [
                    keyof typeof STATUS_CONFIG,
                    (typeof STATUS_CONFIG)[keyof typeof STATUS_CONFIG],
                  ][]
                ).map(([key, config]) => (
                  <button
                    key={key}
                    onClick={() => {
                      setStatus(key);
                      setPage(1);
                    }}
                    className="flex items-center justify-between w-full hover:opacity-80 transition-opacity"
                  >
                    <span className="text-sm text-foreground">
                      {config.label}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn("text-xs", config.className)}
                    >
                      {stats.byStatus[key]}
                    </Badge>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex items-center gap-3">
        <Select
          value={type || "all"}
          onValueChange={(v) => {
            setType(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="bug">Bug</SelectItem>
            <SelectItem value="feature">Feature</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={status || "all"}
          onValueChange={(v) => {
            setStatus(v === "all" ? "" : v);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-36">
            <SelectValue placeholder="All statuses" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All statuses</SelectItem>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="dismissed">Dismissed</SelectItem>
          </SelectContent>
        </Select>

        {(type || status) && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setType("");
              setStatus("");
              setPage(1);
            }}
          >
            Clear filters
          </Button>
        )}
      </div>

      {/* List */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {!isLoading && data?.items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <MessageSquare className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No feedback yet</p>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-3">
          {data?.items.map((item) => (
            <FeedbackCard
              key={item.id}
              item={item}
              slug={slug}
              productSlug={productSlug}
              projectId={id}
            />
          ))}
        </div>
      )}

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
