import { api, twoFactorRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useEnableTwoFactor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (code: string): Promise<{ recoveryCodes: string[] }> => {
      const res = await api.post(twoFactorRoutes.enable(), { code });
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["2fa-status"] });
    },
  });
}
