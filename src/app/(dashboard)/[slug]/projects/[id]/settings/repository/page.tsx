"use client";

import { useProducts } from "@/hooks";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { RepositoryTab } from "@/components/settings/projects/repository-tab";

export default function ProjectSettingsRepositoryPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const projectId = params?.id as string;

  const { data: products } = useProducts(slug);
  const productSlug = products?.[0]?.slug ?? "";

  if (!productSlug) return <Skeleton className="h-64 max-w-2xl" />;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Repository</h1>
        <p className="text-muted-foreground mt-1">
          Connect your source repository for code-level crash analysis
        </p>
      </div>
      <RepositoryTab
        slug={slug}
        productSlug={productSlug}
        projectId={projectId}
      />
    </div>
  );
}
