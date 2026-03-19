import { api, releaseRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteRelease(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (releaseId: string) => {
      await api.delete(
        releaseRoutes.delete(slug, productSlug, projectId, releaseId),
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["releases", slug, productSlug, projectId],
      });
    },
  });
}
