import { api } from "@/lib/api";
import { UpsertAIConfigPayload } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpsertOrgAiConfig(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpsertAIConfigPayload) => {
      const res = await api.post(`/organisations/${slug}/ai-config`, payload);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["ai-config", "org", slug] });
    },
  });
}
