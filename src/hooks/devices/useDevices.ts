import { api, deviceRoutes } from "@/lib/api";
import { useEnvironmentStore } from "@/store/environment.store";
import { PaginatedDevices } from "@/types";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "next/navigation";

export function useDevices(
  slug: string,
  productSlug: string,
  projectId: string,
  page = 1,
) {
  const params = useParams();
  const environment = useEnvironmentStore(
    (s) => s.environments[params?.id as string] ?? null,
  );

  return useQuery<PaginatedDevices>({
    queryKey: ["devices", slug, productSlug, projectId, page, environment],
    queryFn: async () => {
      const p = new URLSearchParams({ page: String(page) });
      if (environment) p.set("environment", environment);
      const res = await api.get(
        `${deviceRoutes.list(slug, productSlug, projectId)}?${p}`,
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
