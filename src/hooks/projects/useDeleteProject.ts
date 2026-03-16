import { api, projectRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteProject(
  slug: string,
  productSlug: string,
  id: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(projectRoutes.delete(slug, productSlug, id));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", slug, productSlug],
      });
    },
  });
}
