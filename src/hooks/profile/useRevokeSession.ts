import { api, profileRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRevokeAllSessions() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(profileRoutes.revokeAll());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
    },
  });
}
