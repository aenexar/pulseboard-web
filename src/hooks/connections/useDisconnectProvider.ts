import { api, connectionRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDisconnectProvider() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (provider: string) => {
      await api.delete(connectionRoutes.disconnect(provider));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["connections"] });
    },
  });
}
