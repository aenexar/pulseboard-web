import { api, deviceRoutes } from "@/lib/api";
import { DeviceDetail } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useDeviceDetail(
  slug: string,
  productSlug: string,
  projectId: string,
  deviceModel: string,
) {
  return useQuery<DeviceDetail>({
    queryKey: ["device", slug, productSlug, projectId, deviceModel],
    queryFn: async () => {
      const res = await api.get(
        deviceRoutes.detail(slug, productSlug, projectId, deviceModel),
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId && !!deviceModel,
  });
}
