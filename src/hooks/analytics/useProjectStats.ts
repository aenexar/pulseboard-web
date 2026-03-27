"use client";

import { analyticsRoutes, api } from "@/lib/api";
import { useEnvironmentStore } from "@/store/environment.store";
import { useQuery } from "@tanstack/react-query";

type ProjectStats = {
  totalSessions: number;
  crashRate: number;
  totalErrors: number;
  avgSessionMinutes: number;
};

export function useProjectStats(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const environment = useEnvironmentStore(
    (s) => s.environments[projectId] ?? null,
  );

  return useQuery<ProjectStats>({
    queryKey: ["project-stats", slug, productSlug, projectId, environment],
    queryFn: async () => {
      const res = await api.get(
        analyticsRoutes.stats(slug, productSlug, projectId),
        { params: environment ? { environment } : {} },
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
