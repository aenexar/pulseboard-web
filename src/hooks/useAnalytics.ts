import { api, projectRoutes } from "@/lib/api";
import { AnalyticsData } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useAnalytics(slug: string, projectId: string) {
  return useQuery<AnalyticsData>({
    queryKey: ["analytics", slug, projectId],
    queryFn: async () => {
      const res = await api.get(projectRoutes.analytics(slug, projectId));
      return res.data.data;
    },
    enabled: !!slug && !!projectId,
  });
}
