import { api, projectRoutes } from "@/lib/api";
import { AIConfig, UpsertAIConfigPayload } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpsertAiConfig(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: UpsertAIConfigPayload) => {
      const res = await api.post(
        projectRoutes.aiConfig(slug, productSlug, projectId),
        data,
      );
      return res.data.data as AIConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ai-config", slug, productSlug, projectId],
      });
    },
  });
}
