import { api, projectRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteAiConfig(slug: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(projectRoutes.aiConfig(slug, projectId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ai-config", slug, projectId],
      });
    },
  });
}
