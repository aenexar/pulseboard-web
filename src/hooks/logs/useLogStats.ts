import { api, logRoutes } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type LogStats = {
  debug: number;
  info: number;
  warn: number;
  error: number;
};

export function useLogStats(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  return useQuery<LogStats>({
    queryKey: ["log-stats", slug, productSlug, projectId],
    queryFn: async () => {
      const res = await api.get(logRoutes.stats(slug, productSlug, projectId));
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
