import { api, projectRoutes } from "@/lib/api";
import { AIConfig } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useAiConfig(slug: string, projectId: string) {
  return useQuery<AIConfig | null>({
    queryKey: ["ai-config", slug, projectId],
    queryFn: async () => {
      const res = await api.get(projectRoutes.aiConfig(slug, projectId));
      return res.data.data;
    },
    enabled: !!slug && !!projectId,
  });
}
