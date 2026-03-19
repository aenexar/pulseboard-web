import { api, authRoutes } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { AuthResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useVerify2FA() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (payload: { challengeToken: string; code: string }) => {
      const res = await api.post<AuthResponse>(authRoutes.verify2FA(), payload);
      return res.data;
    },
    onSuccess: ({ data }) => {
      setAuth(data.user, data.accessToken);
    },
  });
}
