"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useBusinessDocuments,
  useUploadDocument,
  useDeleteDocument,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { BusinessDocument } from "@/types";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  Trash2,
  Upload,
} from "lucide-react";
import { useCallback, useRef } from "react";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const STATUS_CONFIG = {
  processing: {
    icon: Loader2,
    label: "Processing",
    className: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
    animate: true,
  },
  ready: {
    icon: CheckCircle2,
    label: "Ready",
    className: "text-brand border-brand/30 bg-brand/10",
    animate: false,
  },
  failed: {
    icon: AlertTriangle,
    label: "Failed",
    className: "text-destructive border-destructive/30 bg-destructive/10",
    animate: false,
  },
} as const;

// ─── Document row ─────────────────────────────────────────────────────────────

function DocumentRow({
  doc,
  onDelete,
  isDeleting,
}: {
  doc: BusinessDocument;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const status = STATUS_CONFIG[doc.status];
  const StatusIcon = status.icon;

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card">
      {/* File icon */}
      <div className="flex items-center justify-center w-9 h-9 rounded-md bg-muted shrink-0">
        <FileText className="w-4 h-4 text-muted-foreground" />
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-medium text-foreground truncate">
            {doc.fileName}
          </p>
          <Badge
            variant="outline"
            className={cn("text-xs gap-1", status.className)}
          >
            <StatusIcon
              className={cn("w-3 h-3", status.animate && "animate-spin")}
            />
            {status.label}
          </Badge>
        </div>
        <div className="flex items-center gap-3 mt-0.5 text-xs text-muted-foreground">
          <span>{formatBytes(doc.fileSize)}</span>
          {doc.pageCount && <span>{doc.pageCount} pages</span>}
          {doc.status === "ready" && (
            <span>{doc._count.chunks} chunks indexed</span>
          )}
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {new Date(doc.createdAt).toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Uploaded by */}
      <div className="flex items-center gap-1.5 shrink-0">
        <Avatar className="w-5 h-5">
          <AvatarImage src={doc.createdBy.avatarUrl ?? undefined} />
          <AvatarFallback className="text-[8px] bg-brand/10 text-brand">
            {doc.createdBy.name.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <span className="text-xs text-muted-foreground hidden sm:block">
          {doc.createdBy.name}
        </span>
      </div>

      {/* Delete */}
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            disabled={isDeleting}
            className="text-muted-foreground hover:text-destructive h-7 w-7 p-0 shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete &quot;{doc.fileName}&quot; and remove
              it from AI context. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => onDelete(doc.id)}
              className="bg-destructive hover:bg-destructive/90 text-white"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── Drop zone ────────────────────────────────────────────────────────────────

function DropZone({
  onFile,
  isPending,
}: {
  onFile: (file: File) => void;
  isPending: boolean;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback(
    (files: FileList | null) => {
      if (!files?.length) return;
      onFile(files[0]);
    },
    [onFile],
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles],
  );

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      onClick={() => !isPending && inputRef.current?.click()}
      className={cn(
        "flex flex-col items-center justify-center gap-3 p-8",
        "border-2 border-dashed border-border rounded-lg",
        "transition-colors cursor-pointer",
        isPending
          ? "opacity-50 cursor-not-allowed"
          : "hover:border-brand/50 hover:bg-brand/5",
      )}
    >
      <input
        title="Document Upload"
        ref={inputRef}
        type="file"
        accept=".pdf,.txt,.md"
        className="hidden"
        onChange={(e) => handleFiles(e.target.files)}
        disabled={isPending}
      />

      {isPending ? (
        <Loader2 className="w-8 h-8 text-brand animate-spin" />
      ) : (
        <Upload className="w-8 h-8 text-muted-foreground" />
      )}

      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {isPending ? "Uploading..." : "Drop a file or click to browse"}
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          PDF, TXT, or Markdown — up to 20MB (approx. 50 pages)
        </p>
      </div>
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function DocumentUpload({ slug }: { slug: string }) {
  const { data: documents, isLoading } = useBusinessDocuments(slug);
  const upload = useUploadDocument(slug);
  const remove = useDeleteDocument(slug);

  const handleFile = (file: File) => {
    upload.mutate(file);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5 text-muted-foreground" />
          <CardTitle className="text-base">
            Business Context Documents
          </CardTitle>
        </div>
        <CardDescription>
          Upload business documents — strategy briefs, product specs, OKRs —
          that AI will reference when generating insights. Supports PDF, TXT,
          and Markdown up to 20MB.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <DropZone onFile={handleFile} isPending={upload.isPending} />

        {upload.isError && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            Failed to upload. Check file type and size and try again.
          </div>
        )}

        {upload.isSuccess && (
          <div className="flex items-center gap-2 text-sm text-brand">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            Document uploaded — processing in background.
          </div>
        )}

        {/* Document list */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            {documents?.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                No documents uploaded yet. Add one above to enrich AI insights.
              </p>
            )}
            {documents?.map((doc) => (
              <DocumentRow
                key={doc.id}
                doc={doc}
                onDelete={(id) => remove.mutate(id)}
                isDeleting={remove.isPending && remove.variables === doc.id}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
