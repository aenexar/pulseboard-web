import { api, projectRoutes } from "@/lib/api";
import { Insight } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useInsight(
  slug: string,
  productSlug: string,
  projectId: string,
  insightId: string,
) {
  return useQuery<Insight>({
    queryKey: ["insight", slug, productSlug, projectId, insightId],
    queryFn: async () => {
      const res = await api.get(
        projectRoutes.insightById(slug, productSlug, projectId, insightId),
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId && !!insightId,
  });
}
