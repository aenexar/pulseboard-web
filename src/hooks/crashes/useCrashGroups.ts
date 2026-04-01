import { api, crashRoutes } from "@/lib/api";
import { useEnvironmentStore } from "@/store/environment.store";
import { PaginatedCrashGroups } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function useCrashGroups(
  slug: string,
  productSlug: string,
  projectId: string,
  page = 1,
) {
  const params = useParams();
  const environment = useEnvironmentStore(
    (s) => s.environments[params?.id as string] ?? null,
  );

  return useQuery<PaginatedCrashGroups>({
    queryKey: ["crashes", slug, productSlug, projectId, page, environment],
    queryFn: async () => {
      const params = new URLSearchParams({ page: String(page) });
      if (environment) params.set("environment", environment);
      const res = await api.get(
        `${crashRoutes.list(slug, productSlug, projectId)}?${params}`,
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
