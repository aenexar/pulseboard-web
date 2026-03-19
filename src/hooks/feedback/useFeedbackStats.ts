import { api, feedbackRoutes as routes } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type FeedbackStats = {
  byType: { bug: number; feature: number; general: number };
  byStatus: {
    open: number;
    in_progress: number;
    resolved: number;
    dismissed: number;
  };
};

export function useFeedbackStats(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  return useQuery<FeedbackStats>({
    queryKey: ["feedback-stats", slug, productSlug, projectId],
    queryFn: async () => {
      const res = await api.get(routes.stats(slug, productSlug, projectId));
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
