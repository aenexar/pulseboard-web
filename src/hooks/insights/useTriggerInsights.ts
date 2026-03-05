import { api } from "@/lib/api";
import { TriggerInsightsResponse } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useTriggerInsights(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        const { data } = await api.post<TriggerInsightsResponse>(
          `/projects/${projectId}/insights/trigger`,
        );
        return data;
      } catch (error: unknown) {
        // 429 — return the response data so the UI can read minutesRemaining
        if (axios.isAxiosError(error) && error.response?.status === 429) {
          return error.response.data as TriggerInsightsResponse;
        }
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights", projectId] });
      queryClient.invalidateQueries({ queryKey: ["ai-config", projectId] });
    },
  });
}
