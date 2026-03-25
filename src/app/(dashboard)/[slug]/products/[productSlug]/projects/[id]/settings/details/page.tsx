"use client";

import { ProjectDetailsTab } from "@/components/settings/projects/details-tab";
import { useProducts } from "@/hooks";
import { useParams } from "next/navigation";

export default function ProjectSettingsDetailsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const projectId = params?.id as string;
  const { data: products } = useProducts(slug);
  const productSlug = products?.[0]?.slug ?? "";

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Details</h1>
        <p className="text-muted-foreground mt-1">
          Project name, description and framework
        </p>
      </div>
      {productSlug && (
        <ProjectDetailsTab
          slug={slug}
          productSlug={productSlug}
          projectId={projectId}
        />
      )}
    </div>
  );
}
