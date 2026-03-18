import { api, twoFactorRoutes } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useRegenerateRecoveryCodes() {
  return useMutation({
    mutationFn: async (code: string): Promise<{ recoveryCodes: string[] }> => {
      const res = await api.post(twoFactorRoutes.regenerateRecovery(), {
        code,
      });
      return res.data.data;
    },
  });
}
