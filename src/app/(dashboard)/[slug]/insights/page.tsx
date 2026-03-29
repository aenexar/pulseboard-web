"use client";

import { useOrgInsights, useTriggerOrgInsights } from "@/hooks";
import { useParams } from "next/navigation";
import { InsightsView } from "@/components/insights/insights-view";

export default function OrgInsightsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data: insights, isLoading } = useOrgInsights(slug);
  const trigger = useTriggerOrgInsights(slug);

  return (
    <InsightsView
      title="Organisation Insights"
      subtitle="Executive-level AI synthesis across all products and projects"
      insights={insights ?? []}
      isLoading={isLoading}
      onTrigger={() => trigger.mutateAsync()}
      isTriggerPending={trigger.isPending}
      slug={slug}
      level="org"
    />
  );
}
