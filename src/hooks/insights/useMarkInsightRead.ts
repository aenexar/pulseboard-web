import { api, projectRoutes } from "@/lib/api";
import { Insight } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/auth.store";

export function useMarkInsightRead(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const queryClient = useQueryClient();
  const user = useAuthStore((s) => s.user);

  return useMutation({
    mutationFn: async (insightId: string) => {
      await api.patch(
        projectRoutes.markRead(slug, productSlug, projectId, insightId),
      );
    },
    onMutate: async (insightId: string) => {
      const key = ["insights", slug, productSlug, projectId];
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData<Insight[]>(key);

      queryClient.setQueryData<Insight[]>(key, (old) =>
        old?.map((i) => {
          if (i.id !== insightId) return i;
          const alreadyRead = i.reads.some((r) => r.userId === user?.id);
          if (alreadyRead) return i;
          return {
            ...i,
            reads: [
              ...i.reads,
              {
                id: `optimistic-${Date.now()}`,
                insightId,
                userId: user?.id ?? "",
                readAt: new Date().toISOString(),
                user: {
                  id: user?.id ?? "",
                  name: user?.name ?? "",
                  avatarUrl: user?.avatarUrl ?? null,
                },
              },
            ],
          };
        }),
      );
      return { previous };
    },
    onError: (_err, _id, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ["insights", slug, productSlug, projectId],
          context.previous,
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({
        queryKey: ["insights", slug, productSlug, projectId],
      });
    },
  });
}
