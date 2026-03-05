import { api } from "@/lib/api";
import { AIConfig, ApiResponse, UpsertAIConfigPayload } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpsertAIConfig(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertAIConfigPayload) => {
      const { data } = await api.post<ApiResponse<AIConfig>>(
        `/projects/${projectId}/ai-config`,
        payload,
      );
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-config", projectId] });
    },
  });
}
