import { api, orgRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteOrganisation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(orgRoutes.delete(slug));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisations"] });
    },
  });
}
