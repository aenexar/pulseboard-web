"use client";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import {
  useCreateRelease,
  useDeleteRelease,
  useProducts,
  useReleases,
} from "@/hooks";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  GitBranch,
  Plus,
  Tag,
  Trash2,
} from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

// ─── Health Badge ──────────────────────────────────────────────────────────────

function HealthBadge({ crashRate }: { crashRate: number }) {
  if (crashRate === 0) {
    return (
      <Badge
        variant="outline"
        className="text-brand border-brand/30 bg-brand/10"
      >
        Healthy
      </Badge>
    );
  }
  if (crashRate < 1) {
    return (
      <Badge
        variant="outline"
        className="text-yellow-500 border-yellow-500/30 bg-yellow-500/10"
      >
        {crashRate.toFixed(2)}% crash rate
      </Badge>
    );
  }
  return (
    <Badge
      variant="outline"
      className="text-destructive border-destructive/30 bg-destructive/10"
    >
      {crashRate.toFixed(1)}% crash rate
    </Badge>
  );
}

// ─── Create Release Dialog ────────────────────────────────────────────────────

function CreateReleaseDialog({
  slug,
  productSlug,
  projectId,
}: {
  slug: string;
  productSlug: string;
  projectId: string;
}) {
  const [open, setOpen] = useState(false);
  const [version, setVersion] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");

  const createRelease = useCreateRelease(slug, productSlug, projectId);

  const handleCreate = async () => {
    if (!version.trim()) return;
    setError("");
    try {
      await createRelease.mutateAsync({
        version: version.trim(),
        notes: notes.trim() || undefined,
      });
      setVersion("");
      setNotes("");
      setOpen(false);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ?? "Failed to create release")
        : "Failed to create release";
      setError(message);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold">
          <Plus className="w-4 h-4 mr-2" />
          New Release
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle>Create Manual Release</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Version</Label>
            <Input
              placeholder="e.g. 1.2.0"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>
              Release Notes{" "}
              <span className="text-muted-foreground">(optional)</span>
            </Label>
            <Textarea
              placeholder="What changed in this release?"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
          </div>
          {error && (
            <div className="flex items-center gap-2 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
            </div>
          )}
          <Button
            onClick={handleCreate}
            disabled={!version.trim() || createRelease.isPending}
            className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
          >
            {createRelease.isPending ? "Creating..." : "Create Release"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ReleasesPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const id = params?.id as string;

  const { data: products } = useProducts(slug);
  const productSlug = products?.[0]?.slug ?? "";

  const [page, setPage] = useState(1);

  const { data, isLoading } = useReleases(slug, productSlug, id, page);
  const deleteRelease = useDeleteRelease(slug, productSlug, id);

  if (!productSlug) return <Skeleton className="h-96" />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Releases</h1>
          <p className="text-muted-foreground mt-1">
            Track release health and monitor crash rates per version
          </p>
        </div>
        <CreateReleaseDialog
          slug={slug}
          productSlug={productSlug}
          projectId={id}
        />
      </div>

      {/* List */}
      {isLoading && (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      )}

      {!isLoading && data?.items.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-3">
          <Tag className="w-10 h-10 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No releases yet</p>
          <p className="text-xs text-muted-foreground">
            Releases are created automatically from GitHub tags or manually.
          </p>
        </div>
      )}

      {!isLoading && (
        <div className="space-y-3">
          {data?.items.map((release) => (
            <Card key={release.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    {/* Icon */}
                    <div className="w-9 h-9 rounded-lg bg-brand/10 flex items-center justify-center shrink-0">
                      {release.source === "github" ? (
                        <GitBranch className="w-4 h-4 text-brand" />
                      ) : (
                        <Tag className="w-4 h-4 text-brand" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm font-semibold text-foreground font-mono">
                          v{release.version}
                        </span>
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground"
                        >
                          {release.source === "github" ? "GitHub" : "Manual"}
                        </Badge>
                        {release.releaseHealth && (
                          <HealthBadge
                            crashRate={release.releaseHealth.crashRate}
                          />
                        )}
                      </div>

                      {/* Notes */}
                      {release.body && (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {release.body}
                        </p>
                      )}

                      {/* Stats + time */}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {release.releaseHealth && (
                          <>
                            <span>
                              {release.releaseHealth.sessionCount} session
                              {release.releaseHealth.sessionCount !== 1
                                ? "s"
                                : ""}
                            </span>
                            <span>
                              {release.releaseHealth.crashCount} crash
                              {release.releaseHealth.crashCount !== 1
                                ? "es"
                                : ""}
                            </span>
                          </>
                        )}
                        {!release.releaseHealth && <span>No data yet</span>}
                        <span>
                          {formatDistanceToNow(
                            new Date(release.publishedAt ?? release.createdAt),
                            { addSuffix: true },
                          )}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delete — manual only */}
                  {release.source === "manual" && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete release?</AlertDialogTitle>
                          <AlertDialogDescription>
                            v{release.version} and all associated health data
                            will be permanently deleted.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => deleteRelease.mutate(release.id)}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </CardContent>
            </Card>
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
