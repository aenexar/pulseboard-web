import { api, orgRoutes } from "@/lib/api";
import { Organisation } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateOrganisation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: { name: string; slug?: string }) => {
      const res = await api.post(orgRoutes.create(), data);
      return res.data.data as Organisation;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisations"] });
    },
  });
}
