import { api, projectRoutes } from "@/lib/api";
import { Project } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProject(slug: string, id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name?: string;
      description?: string;
      framework?: string;
    }) => {
      const res = await api.patch(projectRoutes.update(slug, id), data);
      return res.data.data as Project;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", slug, id] });
      queryClient.invalidateQueries({ queryKey: ["projects", slug] });
    },
  });
}
