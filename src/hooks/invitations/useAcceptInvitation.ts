import { api, orgRoutes } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useAcceptInvitation() {
  return useMutation({
    mutationFn: async (token: string) => {
      const res = await api.post(orgRoutes.acceptInvite(token), {});
      return res.data.data;
    },
  });
}
