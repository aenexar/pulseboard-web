import { api, orgRoutes } from "@/lib/api";
import { Organisation } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateOrganisation(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name?: string;
      slug?: string;
      logoUrl?: string;
    }) => {
      const res = await api.patch(orgRoutes.update(slug), data);
      return res.data.data as Organisation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisations"] });
      queryClient.invalidateQueries({ queryKey: ["organisations", slug] });
    },
  });
}
