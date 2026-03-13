import { api, projectRoutes } from "@/lib/api";
import { AIConfig, UpsertAIConfigPayload } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpsertAiConfig(slug: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertAIConfigPayload) => {
      const res = await api.post(
        projectRoutes.aiConfig(slug, projectId),
        payload,
      );
      return res.data.data as AIConfig;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ai-config", slug, projectId],
      });
    },
  });
}
