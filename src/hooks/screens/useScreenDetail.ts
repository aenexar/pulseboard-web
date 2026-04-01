import { api, screenRoutes } from "@/lib/api";
import { ScreenDetail } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useScreenDetail(
  slug: string,
  productSlug: string,
  projectId: string,
  screenName: string,
) {
  return useQuery<ScreenDetail>({
    queryKey: ["screen", slug, productSlug, projectId, screenName],
    queryFn: async () => {
      const res = await api.get(
        screenRoutes.detail(slug, productSlug, projectId, screenName),
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId && !!screenName,
  });
}
