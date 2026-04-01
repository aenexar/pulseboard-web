import { api, screenRoutes } from "@/lib/api";
import { useEnvironmentStore } from "@/store/environment.store";
import { PaginatedScreens } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function useScreens(
  slug: string,
  productSlug: string,
  projectId: string,
  page = 1,
) {
  const params = useParams();
  const environment = useEnvironmentStore(
    (s) => s.environments[params?.id as string] ?? null,
  );

  return useQuery<PaginatedScreens>({
    queryKey: ["screens", slug, productSlug, projectId, page, environment],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page) });
      if (environment) p.set("environment", environment);
      const res = await api.get(
        `${screenRoutes.list(slug, productSlug, projectId)}?${p}`,
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
