"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddComment,
  useAddFeedbackNote,
  useAssignFeedback,
  useFeedbackDetail,
  useProjectFeedbackMembers,
  useUpdateFeedbackStatus,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import {
  FeedbackActivityItem,
  FeedbackComment,
  FeedbackStatus,
  FeedbackType,
} from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  Bug,
  CheckCircle2,
  Clock,
  Image as ImageIcon,
  Lightbulb,
  Loader2,
  MessageSquare,
  Save,
  Send,
  User,
} from "lucide-react";
import Image from "next/image";
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

const STATUS_OPTIONS: { value: FeedbackStatus; label: string }[] = [
  { value: "open", label: "Open" },
  { value: "in_progress", label: "In Progress" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

// ─── Activity label ───────────────────────────────────────────────────────────

function activityLabel(item: FeedbackActivityItem): string {
  const name = item.user?.name ?? "Someone";
  switch (item.action) {
    case "viewed":
      return `${name} viewed this feedback`;
    case "commented":
      return `${name} added a comment`;
    case "note_added":
      return `${name} added a team note`;
    case "status_changed": {
      const m = item.metadata as { from: string; to: string } | null;
      return `${name} changed status from ${m?.from ?? "—"} to ${m?.to ?? "—"}`;
    }
    case "assigned": {
      const m = item.metadata as {
        assigneeId: string | null;
        auto?: boolean;
      } | null;
      if (!m?.assigneeId) return `${name} unassigned this feedback`;
      if (m.auto) return "Auto-assigned to sole team member";
      return `${name} assigned this feedback`;
    }
    default:
      return item.action;
  }
}

// ─── Comment row ──────────────────────────────────────────────────────────────

function CommentRow({
  comment,
  role,
}: {
  comment: FeedbackComment;
  role?: string;
}) {
  return (
    <div className="flex gap-3">
      <Avatar className="w-7 h-7 shrink-0 mt-0.5">
        <AvatarImage src={comment.user.avatarUrl ?? undefined} />
        <AvatarFallback className="text-[9px] bg-brand/10 text-brand">
          {comment.user.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-foreground">
            {comment.user.name}
          </span>
          {role && (
            <Badge variant="outline" className="text-[10px] capitalize">
              {role.replace("_", " ")}
            </Badge>
          )}
          <span className="text-[10px] text-muted-foreground">
            {formatDistanceToNow(new Date(comment.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
        <p className="text-sm text-foreground mt-1 leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
}

// ─── Activity row ─────────────────────────────────────────────────────────────

function ActivityRow({ item }: { item: FeedbackActivityItem }) {
  return (
    <div className="flex items-start gap-2.5">
      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center shrink-0 mt-0.5">
        <Clock className="w-2.5 h-2.5 text-muted-foreground" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-muted-foreground">{activityLabel(item)}</p>
        <p className="text-[10px] text-muted-foreground/60 mt-0.5">
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function FeedbackSheet({
  feedbackId,
  open,
  onClose,
  slug,
  productSlug,
  projectId,
}: {
  feedbackId: string | null;
  open: boolean;
  onClose: () => void;
  slug: string;
  productSlug: string;
  projectId: string;
}) {
  const currentUser = useAuthStore((s) => s.user);

  const { data: item, isLoading } = useFeedbackDetail(
    slug,
    productSlug,
    projectId,
    feedbackId,
  );
  const { data: members } = useProjectFeedbackMembers(
    slug,
    productSlug,
    projectId,
  );

  const updateStatus = useUpdateFeedbackStatus(slug, productSlug, projectId);
  const addNote = useAddFeedbackNote(slug, productSlug, projectId);
  const addComment = useAddComment(slug, productSlug, projectId);
  const assign = useAssignFeedback(slug, productSlug, projectId);

  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [screenshotOpen, setScreenshotOpen] = useState(false);

  // Sync note from fetched data
  if (item && note === "" && item.note) setNote(item.note);

  const handleSaveNote = async () => {
    if (!item) return;
    await addNote.mutateAsync({ feedbackId: item.id, note: note.trim() });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  const handleAddComment = async () => {
    if (!item || !commentText.trim()) return;
    await addComment.mutateAsync({
      feedbackId: item.id,
      content: commentText.trim(),
    });
    setCommentText("");
  };

  const memberRole = (userId: string) =>
    members?.find((m) => m.userId === userId)?.role;

  const isMultiMember = (members?.length ?? 0) > 1;

  if (!open) return null;

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          {isLoading || !item ? (
            <div className="space-y-4 mt-6">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-24" />
              <Skeleton className="h-32" />
            </div>
          ) : (
            <>
              <SheetHeader className="mb-6">
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
                      TYPE_CONFIG[item.type].bg,
                    )}
                  >
                    {(() => {
                      const Icon = TYPE_CONFIG[item.type].icon;
                      return (
                        <Icon
                          className={cn(
                            "w-4 h-4",
                            TYPE_CONFIG[item.type].color,
                          )}
                        />
                      );
                    })()}
                  </div>
                  <div>
                    <SheetTitle className="text-base font-semibold leading-snug">
                      {TYPE_CONFIG[item.type].label} Feedback
                    </SheetTitle>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {formatDistanceToNow(new Date(item.createdAt), {
                        addSuffix: true,
                      })}
                    </p>
                  </div>
                </div>
              </SheetHeader>

              <div className="space-y-6">
                {/* Message */}
                <div className="space-y-1.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Message
                  </p>
                  <p className="text-sm text-foreground leading-relaxed bg-muted p-3 rounded-lg">
                    {item.message}
                  </p>
                </div>

                {/* Status + Assignee row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Status
                    </p>
                    <Select
                      value={item.status}
                      onValueChange={(v) =>
                        updateStatus.mutate({
                          feedbackId: item.id,
                          status: v as FeedbackStatus,
                        })
                      }
                    >
                      <SelectTrigger className="h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Assignee — only show if multiple members */}
                  {isMultiMember && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Assignee
                      </p>
                      <Select
                        value={item.assignee?.id ?? "unassigned"}
                        onValueChange={(v) =>
                          assign.mutate({
                            feedbackId: item.id,
                            assigneeId: v === "unassigned" ? null : v,
                          })
                        }
                      >
                        <SelectTrigger className="h-8 text-xs">
                          <SelectValue placeholder="Unassigned" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="unassigned">Unassigned</SelectItem>
                          {members?.map((m) => (
                            <SelectItem key={m.userId} value={m.userId}>
                              {m.user.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Single member — show who it's assigned to */}
                  {!isMultiMember && item.assignee && (
                    <div className="space-y-1.5">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                        Assignee
                      </p>
                      <div className="flex items-center gap-2 h-8">
                        <Avatar className="w-5 h-5">
                          <AvatarImage
                            src={item.assignee.avatarUrl ?? undefined}
                          />
                          <AvatarFallback className="text-[8px] bg-brand/10 text-brand">
                            {item.assignee.name.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="text-xs text-foreground">
                          {item.assignee.name}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* User info */}
                {(item.userName || item.userEmail || item.appVersion) && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Submitted by
                    </p>
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {item.userName ?? item.userEmail ?? "Anonymous"}
                      </span>
                      {item.appVersion && (
                        <Badge variant="outline" className="text-xs ml-auto">
                          v{item.appVersion}
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                {/* Screenshot */}
                {item.screenshotUrl && (
                  <div className="space-y-1.5">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Screenshot
                    </p>
                    <button
                      onClick={() => setScreenshotOpen(true)}
                      className="flex items-center gap-2 text-sm text-brand hover:underline"
                    >
                      <ImageIcon className="w-4 h-4" />
                      View screenshot
                    </button>
                  </div>
                )}

                {/* Team note */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Team Note
                  </p>
                  <Textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    placeholder="Internal note for your team — context, solution, next steps..."
                    rows={3}
                    className="resize-none text-sm"
                  />
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      onClick={handleSaveNote}
                      disabled={addNote.isPending || !note.trim()}
                      className="bg-brand hover:bg-brand/90 text-brand-foreground"
                    >
                      {addNote.isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-3.5 h-3.5 mr-1.5" />
                          Save note
                        </>
                      )}
                    </Button>
                    {noteSaved && (
                      <div className="flex items-center gap-1 text-xs text-brand">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Saved
                      </div>
                    )}
                  </div>
                </div>

                {/* Comments */}
                <div className="space-y-3">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Comments ({item.comments.length})
                  </p>

                  {item.comments.length === 0 && (
                    <p className="text-xs text-muted-foreground">
                      No comments yet — be the first to add context.
                    </p>
                  )}

                  <div className="space-y-4">
                    {item.comments.map((c) => (
                      <CommentRow
                        key={c.id}
                        comment={c}
                        role={memberRole(c.user.id)}
                      />
                    ))}
                  </div>

                  {/* Add comment */}
                  <div className="flex gap-2 mt-2">
                    <Avatar className="w-7 h-7 shrink-0 mt-1">
                      <AvatarImage src={currentUser?.avatarUrl ?? undefined} />
                      <AvatarFallback className="text-[9px] bg-brand/10 text-brand">
                        {currentUser?.name?.slice(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-2">
                      <Textarea
                        value={commentText}
                        onChange={(e) => setCommentText(e.target.value)}
                        placeholder="Add a comment..."
                        rows={2}
                        className="resize-none text-sm"
                        onKeyDown={(e) => {
                          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                            handleAddComment();
                          }
                        }}
                      />
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={handleAddComment}
                        disabled={addComment.isPending || !commentText.trim()}
                        className="gap-1.5"
                      >
                        {addComment.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Send className="w-3.5 h-3.5" />
                        )}
                        Comment
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Activity log */}
                {item.activities.length > 0 && (
                  <div className="space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Activity
                    </p>
                    <div className="space-y-3 border-l border-border pl-3 ml-2">
                      {item.activities.map((a) => (
                        <ActivityRow key={a.id} item={a} />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      {/* Screenshot dialog */}
      {item?.screenshotUrl && (
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
