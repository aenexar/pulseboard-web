import { api, insightRoutes } from "@/lib/api";
import { Insight } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useOrgInsights(slug: string) {
  return useQuery<Insight[]>({
    queryKey: ["insights", slug, "org"],
    queryFn: async () => {
      const res = await api.get(insightRoutes.orgInsights(slug));
      return res.data.data;
    },
    enabled: !!slug,
  });
}
