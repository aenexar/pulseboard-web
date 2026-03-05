import { api } from "@/lib/api";
import { AnalyticsData, ApiResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useAnalytics(projectId: string) {
  return useQuery({
    queryKey: ["analytics", projectId],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<AnalyticsData>>(
        `/projects/${projectId}/analytics`,
      );
      return data.data;
    },
    enabled: !!projectId,
  });
}
