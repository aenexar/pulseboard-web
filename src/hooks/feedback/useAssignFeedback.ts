import { api, feedbackRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAssignFeedback(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      feedbackId,
      assigneeId,
    }: {
      feedbackId: string;
      assigneeId: string | null;
    }) => {
      const res = await api.patch(
        feedbackRoutes.assign(slug, productSlug, projectId, feedbackId),
        { assigneeId },
      );
      return res.data.data;
    },
    onSuccess: (_data, { feedbackId }) => {
      queryClient.invalidateQueries({
        queryKey: ["feedback-detail", slug, productSlug, projectId, feedbackId],
      });
      queryClient.invalidateQueries({
        queryKey: ["feedback-board", slug, productSlug, projectId],
      });
    },
  });
}
