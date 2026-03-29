import { api, insightRoutes } from "@/lib/api";
import { Insight } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useProductInsights(slug: string, productSlug: string) {
  return useQuery<Insight[]>({
    queryKey: ["insights", slug, productSlug, "product"],
    queryFn: async () => {
      const res = await api.get(
        insightRoutes.productInsights(slug, productSlug),
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug,
  });
}
