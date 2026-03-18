import { api, passwordResetRoutes } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useResetPassword() {
  return useMutation({
    mutationFn: async (payload: { token: string; newPassword: string }) => {
      await api.post(passwordResetRoutes.reset(), payload);
    },
  });
}
