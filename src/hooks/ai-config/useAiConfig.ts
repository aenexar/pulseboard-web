import { api } from "@/lib/api";
import { AIConfig, ApiResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useAiConfig(projectId: string) {
  return useQuery({
    queryKey: ["ai-config", projectId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AIConfig | null>>(
        `/projects/${projectId}/ai-config`,
      );
      return data.data;
    },
    enabled: !!projectId,
  });
}
