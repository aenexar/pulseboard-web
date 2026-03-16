import { api, projectRoutes } from "@/lib/api";
import { Project } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProject(
  slug: string,
  productSlug: string,
  id: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name?: string;
      description?: string;
      framework?: string;
    }) => {
      const res = await api.patch(
        projectRoutes.update(slug, productSlug, id),
        data,
      );
      return res.data.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", slug, productSlug, id],
      });
      queryClient.invalidateQueries({
        queryKey: ["projects", slug, productSlug],
      });
    },
  });
}
