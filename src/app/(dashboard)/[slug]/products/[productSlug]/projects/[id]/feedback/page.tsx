"use client";

import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FeedbackSheet } from "@/components/feedback/feedback-sheet";
import {
  useFeedbackBoard,
  useFeedbackStats,
  useUpdateFeedbackStatus,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { FeedbackItem, FeedbackStatus, FeedbackType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import { Bug, Lightbulb, MessageSquare, User } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  FeedbackType,
  {
    label: string;
    icon: React.ElementType;
    color: string;
    bg: string;
  }
> = {
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

const COLUMNS: {
  status: FeedbackStatus;
  label: string;
  color: string;
  border: string;
}[] = [
  {
    status: "open",
    label: "Open",
    color: "text-yellow-500",
    border: "border-yellow-500/30",
  },
  {
    status: "in_progress",
    label: "In Progress",
    color: "text-blue-500",
    border: "border-blue-500/30",
  },
  {
    status: "resolved",
    label: "Resolved",
    color: "text-brand",
    border: "border-brand/30",
  },
  {
    status: "dismissed",
    label: "Dismissed",
    color: "text-muted-foreground",
    border: "border-border",
  },
];

// ─── Kanban card ──────────────────────────────────────────────────────────────

function KanbanCard({
  item,
  onClick,
  slug,
  productSlug,
  projectId,
}: {
  item: FeedbackItem;
  onClick: () => void;
  slug: string;
  productSlug: string;
  projectId: string;
}) {
  const typeConf = TYPE_CONFIG[item.type];
  const TypeIcon = typeConf.icon;
  const updateStatus = useUpdateFeedbackStatus(slug, productSlug, projectId);

  return (
    <Card
      className="p-3 cursor-pointer hover:border-brand/30 transition-colors space-y-2.5"
      onClick={onClick}
    >
      {/* Type + time */}
      <div className="flex items-center justify-between gap-2">
        <div
          className={cn(
            "flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium",
            typeConf.bg,
            typeConf.color,
          )}
        >
          <TypeIcon className="w-3 h-3" />
          {typeConf.label}
        </div>
        <span className="text-[10px] text-muted-foreground">
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </span>
      </div>

      {/* Message */}
      <p className="text-sm text-foreground line-clamp-3 leading-relaxed">
        {item.message}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground min-w-0">
          <User className="w-3 h-3 shrink-0" />
          <span className="truncate">
            {item.userName ?? item.userEmail ?? "Anonymous"}
          </span>
        </div>
        {item.appVersion && (
          <span className="text-[10px] text-muted-foreground shrink-0">
            v{item.appVersion}
          </span>
        )}
      </div>

      {/* Note indicator */}
      {item.note && (
        <div className="text-[10px] text-brand border border-brand/20 bg-brand/5 rounded px-2 py-1 truncate">
          📝 {item.note}
        </div>
      )}

      {/* Move to column */}
      <Select
        value={item.status}
        onValueChange={(v) => {
          updateStatus.mutate({
            feedbackId: item.id,
            status: v as FeedbackStatus,
          });
        }}
      >
        <SelectTrigger
          className="h-7 text-xs w-full"
          onClick={(e) => e.stopPropagation()}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent onClick={(e) => e.stopPropagation()}>
          <SelectItem value="open">Open</SelectItem>
          <SelectItem value="in_progress">In Progress</SelectItem>
          <SelectItem value="resolved">Resolved</SelectItem>
          <SelectItem value="dismissed">Dismissed</SelectItem>
        </SelectContent>
      </Select>
    </Card>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function FeedbackPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const projectId = params?.id as string;
  const productSlug = params?.productSlug as string;

  const [typeFilter, setTypeFilter] = useState<string>("");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sheetOpen, setSheetOpen] = useState(false);

  const { data: board, isLoading } = useFeedbackBoard(
    slug,
    productSlug,
    projectId,
    typeFilter || undefined,
  );
  const { data: stats } = useFeedbackStats(slug, productSlug, projectId);

  const openSheet = (id: string) => {
    setSelectedId(id);
    setSheetOpen(true);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Feedback</h1>
          <p className="text-muted-foreground mt-1">
            User feedback and bug reports from your app
          </p>
        </div>

        {/* Stats + filter */}
        <div className="flex items-center gap-3 flex-wrap">
          {stats && (
            <div className="flex items-center gap-2">
              {(
                Object.entries(TYPE_CONFIG) as [
                  FeedbackType,
                  (typeof TYPE_CONFIG)[FeedbackType],
                ][]
              ).map(([key, conf]) => (
                <button
                  key={key}
                  onClick={() => setTypeFilter(typeFilter === key ? "" : key)}
                  className={cn(
                    "flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors",
                    typeFilter === key
                      ? `${conf.bg} ${conf.color}`
                      : "text-muted-foreground hover:text-foreground hover:bg-accent",
                  )}
                >
                  <conf.icon className="w-3 h-3" />
                  {conf.label}
                  <span className="opacity-70">{stats.byType[key]}</span>
                </button>
              ))}
            </div>
          )}

          {typeFilter && (
            <button
              onClick={() => setTypeFilter("")}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Kanban board */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="space-y-3">
              <Skeleton className="h-6 w-24" />
              {[...Array(3)].map((_, j) => (
                <Skeleton key={j} className="h-28" />
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 items-start">
          {COLUMNS.map((col) => {
            const items = board?.[col.status] ?? [];
            return (
              <div key={col.status} className="space-y-3">
                {/* Column header */}
                <div
                  className={cn(
                    "flex items-center justify-between px-3 py-2 rounded-lg border",
                    col.border,
                    "bg-card",
                  )}
                >
                  <span className={cn("text-sm font-semibold", col.color)}>
                    {col.label}
                  </span>
                  <Badge
                    variant="outline"
                    className={cn("text-xs", col.color, col.border)}
                  >
                    {items.length}
                  </Badge>
                </div>

                {/* Cards */}
                <div className="space-y-2.5">
                  {items.length === 0 ? (
                    <div className="flex items-center justify-center py-8 border border-dashed border-border rounded-lg">
                      <p className="text-xs text-muted-foreground">No items</p>
                    </div>
                  ) : (
                    items.map((item) => (
                      <KanbanCard
                        key={item.id}
                        item={item}
                        onClick={() => openSheet(item.id)}
                        slug={slug}
                        productSlug={productSlug}
                        projectId={projectId}
                      />
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Detail sheet */}
      <FeedbackSheet
        feedbackId={selectedId}
        open={sheetOpen}
        onClose={() => {
          setSheetOpen(false);
          setSelectedId(null);
        }}
        slug={slug}
        productSlug={productSlug}
        projectId={projectId}
      />
    </div>
  );
}
