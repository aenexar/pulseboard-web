import { api, projectRoutes } from "@/lib/api";
import { Insight } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useInsights(slug: string, projectId: string) {
  return useQuery<Insight[]>({
    queryKey: ["insights", slug, projectId],
    queryFn: async () => {
      const res = await api.get(projectRoutes.insights(slug, projectId));
      return res.data.data;
    },
    enabled: !!slug && !!projectId,
  });
}
