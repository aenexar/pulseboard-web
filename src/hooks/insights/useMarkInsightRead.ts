import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMarkInsightRead(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insightId: string) => {
      await api.patch(`/projects/${projectId}/insights/${insightId}/read`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights", projectId] });
    },
  });
}
