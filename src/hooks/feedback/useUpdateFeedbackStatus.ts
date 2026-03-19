import { api, feedbackRoutes as routes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateFeedbackStatus(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      feedbackId,
      status,
    }: {
      feedbackId: string;
      status: "open" | "in_progress" | "resolved" | "dismissed";
    }) => {
      await api.patch(
        routes.updateStatus(slug, productSlug, projectId, feedbackId),
        { status },
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feedback", slug, productSlug, projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ["feedback-stats", slug, productSlug, projectId],
      });
    },
  });
}
