import { api, aiActivityRoutes } from "@/lib/api";
import { AIActivityResponse } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useAIActivity(slug: string, page = 1) {
  return useQuery<AIActivityResponse>({
    queryKey: ["ai-activity", slug, page],
    queryFn: async () => {
      const res = await api.get(`${aiActivityRoutes.list(slug)}?page=${page}`);
      return res.data.data;
    },
    enabled: !!slug,
  });
}
