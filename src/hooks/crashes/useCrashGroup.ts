import { api, crashRoutes } from "@/lib/api";
import { CrashGroupDetail } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useCrashGroup(
  slug: string,
  productSlug: string,
  projectId: string,
  crashGroupId: string,
) {
  return useQuery<CrashGroupDetail>({
    queryKey: ["crash", slug, productSlug, projectId, crashGroupId],
    queryFn: async () => {
      const res = await api.get(
        crashRoutes.detail(slug, productSlug, projectId, crashGroupId),
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId && !!crashGroupId,
  });
}
