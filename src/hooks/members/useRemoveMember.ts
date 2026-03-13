import { api, orgRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRemoveMember(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      await api.delete(orgRoutes.removeMember(slug, userId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisations", slug] });
    },
  });
}
