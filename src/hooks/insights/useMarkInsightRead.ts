import { api, projectRoutes } from "@/lib/api";
import { Insight } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMarkInsightRead(slug: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insightId: string) => {
      await api.patch(projectRoutes.markRead(slug, projectId, insightId), {});
    },
    onMutate: async (insightId: string) => {
      await queryClient.cancelQueries({
        queryKey: ["insights", slug, projectId],
      });
      const previous = queryClient.getQueryData<Insight[]>([
        "insights",
        slug,
        projectId,
      ]);
      queryClient.setQueryData<Insight[]>(
        ["insights", slug, projectId],
        (old) =>
          old?.map((i) => (i.id === insightId ? { ...i, isRead: true } : i)),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["insights", slug, projectId],
          context.previous,
        );
      }
    },
  });
}
