import { activityRoutes, api } from "@/lib/api";
import { ActivityLog, PaginatedActivity } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useOrgActivity(slug: string, page = 1) {
  return useQuery({
    queryKey: ["activity", "org", slug, page],
    queryFn: async (): Promise<PaginatedActivity<ActivityLog>> => {
      const res = await api.get<{
        success: boolean;
        data: PaginatedActivity<ActivityLog>;
      }>(activityRoutes.org(slug), { params: { page, limit: 30 } });
      return res.data.data;
    },
    enabled: !!slug,
  });
}
