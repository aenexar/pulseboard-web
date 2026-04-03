import { api, aiActivityRoutes } from "@/lib/api";
import { BusinessImpactReport } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useBusinessImpact(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  return useQuery<BusinessImpactReport>({
    queryKey: ["business-impact", slug, productSlug, projectId],
    queryFn: async () => {
      const res = await api.get(
        aiActivityRoutes.businessImpact(slug, productSlug, projectId),
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
