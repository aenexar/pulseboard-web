import { api } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteOrgAiConfig(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(`/organisations/${slug}/ai-config`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-config", "org", slug] });
    },
  });
}
