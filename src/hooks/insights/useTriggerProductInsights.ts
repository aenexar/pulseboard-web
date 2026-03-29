import { api, insightRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useTriggerProductInsights(slug: string, productSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post(
        insightRoutes.triggerProduct(slug, productSlug),
      );
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["insights", slug, productSlug, "product"],
      });
    },
  });
}
