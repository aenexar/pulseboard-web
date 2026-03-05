import { api } from "@/lib/api";
import { Insight } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useMarkInsightRead(projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (insightId: string) => {
      await api.patch(`/projects/${projectId}/insights/${insightId}/read`);
      return insightId;
    },
    // Optimistic update — mark as read immediately before API confirms
    onMutate: async (insightId: string) => {
      await queryClient.cancelQueries({ queryKey: ["insights", projectId] });

      const previous = queryClient.getQueryData<Insight[]>([
        "insights",
        projectId,
      ]);

      queryClient.setQueryData<Insight[]>(
        ["insights", projectId],
        (old) =>
          old?.map((i) => (i.id === insightId ? { ...i, isRead: true } : i)) ??
          [],
      );

      return { previous };
    },
    // Rollback on error
    onError: (_err, _id, context) => {
      console.log({ _err });
      if (context?.previous) {
        queryClient.setQueryData(["insights", projectId], context.previous);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["insights", projectId] });
    },
  });
}
