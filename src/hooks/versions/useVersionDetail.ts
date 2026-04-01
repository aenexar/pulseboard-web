import { api, versionRoutes } from "@/lib/api";
import { VersionDetail } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useVersionDetail(
  slug: string,
  productSlug: string,
  projectId: string,
  appVersion: string,
) {
  return useQuery<VersionDetail>({
    queryKey: ["version", slug, productSlug, projectId, appVersion],
    queryFn: async () => {
      const res = await api.get(
        versionRoutes.detail(slug, productSlug, projectId, appVersion),
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId && !!appVersion,
  });
}
