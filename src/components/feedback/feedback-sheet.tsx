"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import { Textarea } from "@/components/ui/textarea";
import { useAddFeedbackNote, useUpdateFeedbackStatus } from "@/hooks";
import { cn } from "@/lib/utils";
import { FeedbackItem, FeedbackStatus, FeedbackType } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  Bug,
  CheckCircle2,
  Image as ImageIcon,
  Lightbulb,
  Loader2,
  MessageSquare,
  Save,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";

// ─── Config ───────────────────────────────────────────────────────────────────

const TYPE_CONFIG: Record<
  FeedbackType,
  { label: string; icon: React.ElementType; color: string; bg: string }
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

// ─── Component ────────────────────────────────────────────────────────────────

export function FeedbackSheet({
  item,
  open,
  onClose,
  slug,
  productSlug,
  projectId,
}: {
  item: FeedbackItem | null;
  open: boolean;
  onClose: () => void;
  slug: string;
  productSlug: string;
  projectId: string;
}) {
  const [note, setNote] = useState(item?.note ?? "");
  const [noteSaved, setNoteSaved] = useState(false);
  const [screenshotOpen, setScreenshotOpen] = useState(false);

  const updateStatus = useUpdateFeedbackStatus(slug, productSlug, projectId);
  const addNote = useAddFeedbackNote(slug, productSlug, projectId);

  const handleSaveNote = async () => {
    if (!item) return;
    await addNote.mutateAsync({ feedbackId: item.id, note: note.trim() });
    setNoteSaved(true);
    setTimeout(() => setNoteSaved(false), 2000);
  };

  if (!item) return null;

  const typeConf = TYPE_CONFIG[item.type];
  const TypeIcon = typeConf.icon;

  return (
    <>
      <Sheet open={open} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
          <SheetHeader className="mb-6">
            <div className="flex items-start gap-3">
              <div
                className={cn(
                  "flex items-center justify-center w-9 h-9 rounded-lg shrink-0",
                  typeConf.bg,
                )}
              >
                <TypeIcon className={cn("w-4 h-4", typeConf.color)} />
              </div>
              <div>
                <SheetTitle className="text-base font-semibold leading-snug">
                  {typeConf.label} Feedback
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

            {/* Status */}
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
                <SelectTrigger className="w-48">
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

            {/* User info */}
            {(item.userName || item.userEmail || item.appVersion) && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  User
                </p>
                <div className="flex items-center gap-2 text-sm text-foreground">
                  <Avatar className="w-6 h-6">
                    <AvatarFallback className="text-[9px] bg-brand/10 text-brand">
                      {(item.userName ?? item.userEmail ?? "U")
                        .slice(0, 2)
                        .toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span>
                    {item.userName ?? item.userEmail ?? "Unknown user"}
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
              <p className="text-xs text-muted-foreground">
                Add a note for your team — context, solution, or next steps.
              </p>
              <Textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="e.g. Reproduced on Android 14 — fix in next sprint..."
                rows={4}
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
          </div>
        </SheetContent>
      </Sheet>

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
