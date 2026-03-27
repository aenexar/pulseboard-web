"use client";

import { api, projectRoutes } from "@/lib/api";
import { useEnvironmentStore } from "@/store/environment.store";
import { AnalyticsData } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useAnalytics(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const environment = useEnvironmentStore(
    (s) => s.environments[projectId] ?? null,
  );

  return useQuery<AnalyticsData>({
    queryKey: ["analytics", slug, productSlug, projectId, environment],
    queryFn: async () => {
      const res = await api.get(
        projectRoutes.analytics(slug, productSlug, projectId),
        { params: environment ? { environment } : {} },
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
