import { api, projectRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

export function useTriggerInsights(slug: string, projectId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const res = await api.post(projectRoutes.trigger(slug, projectId), {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["insights", slug, projectId],
      });
    },
    onError: (error) => {
      if (axios.isAxiosError(error) && error.response?.status === 429) {
        return error.response.data;
      }
    },
  });
}
