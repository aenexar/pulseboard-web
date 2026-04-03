import { api, feedbackRoutes } from "@/lib/api";
import { FeedbackItemDetail } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useFeedbackDetail(
  slug: string,
  productSlug: string,
  projectId: string,
  feedbackId: string | null,
) {
  return useQuery<FeedbackItemDetail>({
    queryKey: ["feedback-detail", slug, productSlug, projectId, feedbackId],
    queryFn: async () => {
      const res = await api.get(
        feedbackRoutes.get(slug, productSlug, projectId, feedbackId!),
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId && !!feedbackId,
  });
}
