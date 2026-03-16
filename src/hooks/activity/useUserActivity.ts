import { activityRoutes, api } from "@/lib/api";
import { PaginatedActivity, UserActivityLog } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useUserActivity(page = 1) {
  return useQuery({
    queryKey: ["activity", "user", page],
    queryFn: async (): Promise<PaginatedActivity<UserActivityLog>> => {
      const res = await api.get<{
        success: boolean;
        data: PaginatedActivity<UserActivityLog>;
      }>(activityRoutes.user(), { params: { page, limit: 30 } });
      return res.data.data;
    },
  });
}
