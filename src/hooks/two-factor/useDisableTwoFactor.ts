import { api, twoFactorRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDisableTwoFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string) => {
      await api.post(twoFactorRoutes.disable(), { code });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["2fa-status"] });
    },
  });
}
