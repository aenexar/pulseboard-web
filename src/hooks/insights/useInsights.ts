import { api } from "@/lib/api";
import { ApiResponse, Insight } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useInsights(projectId: string) {
  return useQuery({
    queryKey: ["insights", projectId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Insight[]>>(
        `/projects/${projectId}/insights`,
      );
      return data.data;
    },
    enabled: !!projectId,
  });
}
