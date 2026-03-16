import { api, projectRoutes } from "@/lib/api";
import { AIConfig } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useAiConfig(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  return useQuery<AIConfig | null>({
    queryKey: ["ai-config", slug, productSlug, projectId],
    queryFn: async () => {
      const res = await api.get(
        projectRoutes.aiConfig(slug, productSlug, projectId),
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
