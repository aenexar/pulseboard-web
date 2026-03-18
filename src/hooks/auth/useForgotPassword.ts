import { api, passwordResetRoutes } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useForgotPassword() {
  return useMutation({
    mutationFn: async (email: string) => {
      await api.post(passwordResetRoutes.request(), { email });
    },
  });
}
