import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { AuthResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: { email: string; password: string }) => {
      const response = await api.post<AuthResponse>("/auth/login", data);
      return response.data;
    },
    onSuccess: ({ data }) => {
      setAuth(data.user, data.accessToken);
    },
  });
}
