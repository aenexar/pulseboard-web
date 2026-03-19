import { api, releaseRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

type ReleaseHealth = {
  sessionCount: number;
  crashCount: number;
  crashRate: number;
};

type ReleaseItem = {
  id: string;
  version: string;
  name: string | null;
  body: string | null;
  source: string;
  publishedAt: string | null;
  createdAt: string;
  releaseHealth: ReleaseHealth | null;
};

export function useCreateRelease(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: { version: string; notes?: string }) => {
      const res = await api.post(
        releaseRoutes.create(slug, productSlug, projectId),
        payload,
      );
      return res.data.data as ReleaseItem;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["releases", slug, productSlug, projectId],
      });
    },
  });
}
