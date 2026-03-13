import { api, orgRoutes } from "@/lib/api";
import { Invitation } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useInvitationByToken(token: string) {
  return useQuery<
    Invitation & { organisation: { name: string; slug: string } }
  >({
    queryKey: ["invitation", token],
    queryFn: async () => {
      const res = await api.get(orgRoutes.getInvite(token));
      return res.data.data;
    },
    enabled: !!token,
    retry: false,
  });
}
