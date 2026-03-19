import { api, releaseRoutes } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

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

export function useReleases(
  slug: string,
  productSlug: string,
  projectId: string,
  page = 1,
) {
  return useQuery({
    queryKey: ["releases", slug, productSlug, projectId, page],
    queryFn: async () => {
      const res = await api.get(
        `${releaseRoutes.list(slug, productSlug, projectId)}?page=${page}`,
      );
      return res.data.data as {
        items: ReleaseItem[];
        total: number;
        page: number;
        hasMore: boolean;
      };
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
