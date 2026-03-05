import { api } from "@/lib/api";
import { TriggerInsightsResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useTriggerInsights(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post<TriggerInsightsResponse>(
        `/projects/${projectId}/insights/trigger`,
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights", projectId] });
      queryClient.invalidateQueries({ queryKey: ["ai-config", projectId] });
    },
  });
}
