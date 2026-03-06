import { api } from "@/lib/api";
import { ApiResponse, Project } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProject(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      name?: string;
      description?: string;
      framework?: string;
    }) => {
      const { data } = await api.patch<ApiResponse<Project>>(
        `/projects/${projectId}`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
      queryClient.invalidateQueries({ queryKey: ["projects"] });
    },
  });
}
