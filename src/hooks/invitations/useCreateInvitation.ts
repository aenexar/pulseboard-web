import { api, orgRoutes } from "@/lib/api";
import { Invitation, MemberRole } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateInvitation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { email: string; role: MemberRole }) => {
      const res = await api.post(orgRoutes.invitations(slug), data);
      return res.data.data as Invitation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["invitations", slug] });
    },
  });
}
