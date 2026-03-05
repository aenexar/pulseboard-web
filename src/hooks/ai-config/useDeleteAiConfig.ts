import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteAiConfig(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/projects/${projectId}/ai-config`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-config", projectId] });
      queryClient.invalidateQueries({ queryKey: ["insights", projectId] });
    },
  });
}
