import { api, projectRoutes } from "@/lib/api";
import { Project } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateRepository(
  slug: string,
  productSlug: string,
  id: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      provider: string;
      url: string;
      branch: string;
    }) => {
      const res = await api.patch(
        projectRoutes.repository(slug, productSlug, id),
        data,
      );
      return res.data.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", slug, productSlug, id],
      });
    },
  });
}
