import { api } from "@/lib/api";
import { ApiResponse, Project, Repository } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateRepository(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: Repository) => {
      const { data } = await api.patch<ApiResponse<Project>>(
        `/projects/${projectId}/repository`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["projects", projectId] });
    },
  });
}
