import { api, orgRoutes } from "@/lib/api";
import { MemberRole } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateMemberRole(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userId,
      role,
    }: {
      userId: string;
      role: MemberRole;
    }) => {
      await api.patch(orgRoutes.updateMember(slug, userId), { role });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisations", slug] });
    },
  });
}
