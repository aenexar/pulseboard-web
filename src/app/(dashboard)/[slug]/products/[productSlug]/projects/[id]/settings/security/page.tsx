"use client";

import { useProducts } from "@/hooks";
import { useParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import { SecurityTab } from "@/components/settings/projects/security-tab";

export default function ProjectSettingsSecurityPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const projectId = params?.id as string;

  const { data: products } = useProducts(slug);
  const productSlug = products?.[0]?.slug ?? "";

  if (!productSlug) return <Skeleton className="h-64 max-w-2xl" />;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security</h1>
        <p className="text-muted-foreground mt-1">
          Danger zone — destructive actions that cannot be undone
        </p>
      </div>
      <SecurityTab
        slug={slug}
        productSlug={productSlug}
        projectId={projectId}
      />
    </div>
  );
}
