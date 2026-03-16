import { api, projectRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteAiConfig(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(projectRoutes.aiConfig(slug, productSlug, projectId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["ai-config", slug, productSlug, projectId],
      });
    },
  });
}
