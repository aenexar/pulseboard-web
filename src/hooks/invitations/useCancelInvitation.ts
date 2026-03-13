import { api, orgRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCancelInvitation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (token: string) => {
      await api.delete(orgRoutes.cancelInvite(token));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations", slug] });
    },
  });
}
