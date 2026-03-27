"use client";

import { analyticsRoutes, api } from "@/lib/api";
import { useEnvironmentStore } from "@/store/environment.store";
import { useQuery } from "@tanstack/react-query";

export type ChartDataPoint = {
  date: string;
  label: string;
  sessions: number;
  crashes: number;
  crashRate: number;
};

export function useProjectChart(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const environment = useEnvironmentStore(
    (s) => s.environments[projectId] ?? null,
  );

  return useQuery<ChartDataPoint[]>({
    queryKey: ["project-chart", slug, productSlug, projectId, environment],
    queryFn: async () => {
      const res = await api.get(
        analyticsRoutes.chart(slug, productSlug, projectId),
        { params: environment ? { environment } : {} },
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
