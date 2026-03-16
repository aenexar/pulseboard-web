import { api, projectRoutes } from "@/lib/api";
import { Project } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateProject(slug: string, productSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      const res = await api.post(projectRoutes.create(slug, productSlug), {
        name,
      });
      return res.data.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["projects", slug, productSlug],
      });
    },
  });
}
