"use client";

import { useProducts } from "@/hooks";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { AIConfigTab } from "@/components/settings/projects/ai-tab";

export default function ProjectSettingsAIPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const projectId = params?.id as string;

  const { data: products } = useProducts(slug);
  const productSlug = products?.[0]?.slug ?? "";

  if (!productSlug) return <Skeleton className="h-64 max-w-2xl" />;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">AI Config</h1>
        <p className="text-muted-foreground mt-1">
          Configure your AI provider for automated insights
        </p>
      </div>
      <AIConfigTab
        slug={slug}
        productSlug={productSlug}
        projectId={projectId}
      />
    </div>
  );
}
