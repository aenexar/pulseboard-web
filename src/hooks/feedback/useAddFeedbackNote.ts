import { api, feedbackRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useAddFeedbackNote(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      feedbackId,
      note,
    }: {
      feedbackId: string;
      note: string;
    }) => {
      const res = await api.patch(
        feedbackRoutes.note(slug, productSlug, projectId, feedbackId),
        { note },
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["feedback-board", slug, productSlug, projectId],
      });
    },
  });
}
