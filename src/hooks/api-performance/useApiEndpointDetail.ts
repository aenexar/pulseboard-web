import { api, apiPerformanceRoutes } from "@/lib/api";
import { ApiEndpointDetail } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useApiEndpointDetail(
  slug: string,
  productSlug: string,
  projectId: string,
  endpoint: string,
  method?: string,
) {
  return useQuery<ApiEndpointDetail>({
    queryKey: ["api-endpoint", slug, productSlug, projectId, endpoint, method],
    queryFn: async () => {
      const p = new URLSearchParams();
      if (method) p.set("method", method);
      const url = `${apiPerformanceRoutes.detail(slug, productSlug, projectId, endpoint)}?${p}`;
      const res = await api.get(url);
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId && !!endpoint,
  });
}
