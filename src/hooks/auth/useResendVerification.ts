import { api, verificationRoutes } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useResendVerification() {
  return useMutation({
    mutationFn: async () => {
      await api.post(verificationRoutes.resend());
    },
  });
}
