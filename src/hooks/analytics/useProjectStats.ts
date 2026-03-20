import { api, analyticsRoutes } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type ProjectStats = {
  totalSessions: number;
  crashRate: number;
  totalErrors: number;
  avgSessionMinutes: number;
};

export function useProjectStats(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  return useQuery<ProjectStats>({
    queryKey: ["project-stats", slug, productSlug, projectId],
    queryFn: async () => {
      const res = await api.get(
        analyticsRoutes.stats(slug, productSlug, projectId),
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
