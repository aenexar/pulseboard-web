import { api } from "@/lib/api";
import { AIConfig } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useOrgAiConfig(slug: string) {
  return useQuery<AIConfig | null>({
    queryKey: ["ai-config", "org", slug],
    queryFn: async () => {
      const res = await api.get(`/organisations/${slug}/ai-config`);
      return res.data.data ?? null;
    },
    enabled: !!slug,
  });
}
