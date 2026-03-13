import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { AuthResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";

export function useRegister() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: {
      name: string;
      email: string;
      password: string;
    }) => {
      const response = await api.post<AuthResponse>("/auth/register", data);
      return response.data;
    },
    onSuccess: ({ data }) => {
      setAuth(data.user, data.accessToken);
    },
  });
}
