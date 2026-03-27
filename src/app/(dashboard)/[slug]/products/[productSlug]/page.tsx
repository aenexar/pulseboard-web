"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FrameworkIcon } from "@/components/framework-icons";
import { useProduct, useProjects } from "@/hooks";
import { cn } from "@/lib/utils";
import { Framework, FRAMEWORK_LABELS } from "@/types";
import { ArrowRight, FolderKanban, Package, Settings } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

export default function ProductOverviewPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;

  const { data: product, isLoading: productLoading } = useProduct(
    slug,
    productSlug,
  );
  const { data: projects, isLoading: projectsLoading } = useProjects(
    slug,
    productSlug,
  );

  const isLoading = productLoading || projectsLoading;

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Package className="w-5 h-5 text-muted-foreground" />
            <h1 className="text-2xl font-bold text-foreground">
              {product?.name}
            </h1>
          </div>
          {product?.description && (
            <p className="text-muted-foreground mt-1 ml-8">
              {product.description}
            </p>
          )}
        </div>
        <Link href={`/${slug}/products/${productSlug}/settings`}>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </Button>
        </Link>
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-6 px-1">
        <div>
          <p className="text-2xl font-bold text-foreground">
            {projects?.length ?? 0}
          </p>
          <p className="text-xs text-muted-foreground">
            Project{projects?.length !== 1 ? "s" : ""}
          </p>
        </div>
        <div>
          <p className="text-2xl font-bold text-foreground">
            {projects
              ?.reduce((acc, p) => acc + (p._count?.events ?? 0), 0)
              .toLocaleString()}
          </p>
          <p className="text-xs text-muted-foreground">Total events</p>
        </div>
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-foreground">Projects</h2>
          <Link
            href={`/${slug}/products/${productSlug}/projects`}
            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3 h-3" />
          </Link>
        </div>

        {projects?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 border border-dashed border-border rounded-lg">
            <FolderKanban className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground">
              No projects yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first project under this product
            </p>
            <Link
              href={`/${slug}/products/${productSlug}/projects`}
              className="mt-4 text-sm text-brand hover:underline"
            >
              Go to Projects →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <Link
              key={project.id}
              href={`/${slug}/products/${productSlug}/projects/${project.id}`}
              className="group p-4 rounded-lg bg-card border border-border hover:border-brand/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {project.framework && (
                      <FrameworkIcon
                        framework={project.framework as Framework}
                        size={14}
                        className="shrink-0"
                      />
                    )}
                    <p className="font-medium text-foreground truncate">
                      {project.name}
                    </p>
                  </div>
                  {project.framework && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {FRAMEWORK_LABELS[project.framework as Framework] ??
                        project.framework}
                    </p>
                  )}
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mt-0.5" />
              </div>
              <div className="mt-3">
                <Badge
                  variant="outline"
                  className="text-xs font-mono text-muted-foreground border-border"
                >
                  {(project._count?.events ?? 0).toLocaleString()} events
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* AI context labels */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand" />
          <p className="text-sm font-semibold text-foreground">
            AI context for this product
          </p>
        </div>
        <p className="text-xs text-muted-foreground">
          When AI insights are generated, the model receives this context to
          make analysis more relevant.
        </p>
        <div className="space-y-2">
          {[
            { label: "Product name", value: product?.name ?? "—" },
            {
              label: "Product description",
              value:
                product?.description ??
                "Not set — add one in settings to improve AI accuracy",
            },
          ].map(({ label, value }) => (
            <div key={label} className="flex gap-3 text-xs">
              <span className="text-muted-foreground w-36 shrink-0">
                {label}
              </span>
              <span
                className={cn(
                  "text-foreground",
                  !product?.description &&
                    label === "Product description" &&
                    "text-muted-foreground italic",
                )}
              >
                {value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
