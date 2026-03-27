import { api, projectRoutes } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useExplainInsight(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  return useMutation({
    mutationFn: async (insightId: string) => {
      const res = await api.post(
        projectRoutes.explainInsight(slug, productSlug, projectId, insightId),
      );
      return res.data.data.explanation as string;
    },
  });
}
