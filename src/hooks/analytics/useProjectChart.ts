import { api, analyticsRoutes } from "@/lib/api";
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
  return useQuery<ChartDataPoint[]>({
    queryKey: ["project-chart", slug, productSlug, projectId],
    queryFn: async () => {
      const res = await api.get(
        analyticsRoutes.chart(slug, productSlug, projectId),
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
