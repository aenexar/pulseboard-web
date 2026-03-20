import { api, sessionAuditRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRevokeAllAuditSessions() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async () => {
      await api.delete(sessionAuditRoutes.revokeAll());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-audit"] });
    },
  });
}
