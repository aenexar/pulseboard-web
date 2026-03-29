"use client";

import { InsightsView } from "@/components/insights/insights-view";
import { useProductInsights, useTriggerProductInsights } from "@/hooks";
import { useParams } from "next/navigation";

export default function ProductInsightsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;

  const { data: insights, isLoading } = useProductInsights(slug, productSlug);
  const trigger = useTriggerProductInsights(slug, productSlug);

  return (
    <InsightsView
      title="Product Insights"
      subtitle="AI analysis synthesised across all projects in this product"
      insights={insights ?? []}
      isLoading={isLoading}
      onTrigger={() => trigger.mutateAsync()}
      isTriggerPending={trigger.isPending}
      slug={slug}
      productSlug={productSlug}
      level="product"
    />
  );
}
