import { api, feedbackRoutes } from "@/lib/api";
import { FeedbackStats } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useFeedbackStats(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  return useQuery<FeedbackStats>({
    queryKey: ["feedback-stats", slug, productSlug, projectId],
    queryFn: async () => {
      const res = await api.get(
        feedbackRoutes.stats(slug, productSlug, projectId),
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
