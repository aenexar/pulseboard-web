import { api, feedbackRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddComment(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      feedbackId,
      content,
    }: {
      feedbackId: string;
      content: string;
    }) => {
      const res = await api.post(
        feedbackRoutes.comments(slug, productSlug, projectId, feedbackId),
        { content },
      );
      return res.data.data;
    },
    onSuccess: (_data, { feedbackId }) => {
      queryClient.invalidateQueries({
        queryKey: ["feedback-detail", slug, productSlug, projectId, feedbackId],
      });
    },
  });
}
