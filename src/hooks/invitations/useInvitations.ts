import { api, orgRoutes } from "@/lib/api";
import { Invitation } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useInvitations(slug: string) {
  return useQuery<Invitation[]>({
    queryKey: ["invitations", slug],
    queryFn: async () => {
      const res = await api.get(orgRoutes.invitations(slug));
      return res.data.data;
    },
    enabled: !!slug,
  });
}
