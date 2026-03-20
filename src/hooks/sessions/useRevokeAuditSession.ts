import { api, sessionAuditRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRevokeAuditSession() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (sessionId: string) => {
      await api.delete(sessionAuditRoutes.revoke(sessionId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["session-audit"] });
    },
  });
}
