import { api } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { AuthResponse } from "@/types";
import { useMutation } from "@tanstack/react-query";

type LoginResult =
  | { require2FA: false; data: AuthResponse["data"] }
  | { require2FA: true; challengeToken: string };

export function useLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (data: {
      email: string;
      password: string;
    }): Promise<LoginResult> => {
      const response = await api.post("/auth/login", data);

      if (response.data.require2FA) {
        return {
          require2FA: true,
          challengeToken: response.data.challengeToken,
        };
      }

      return { require2FA: false, data: response.data.data };
    },
    onSuccess: (result) => {
      if (!result.require2FA) {
        setAuth(result.data.user, result.data.accessToken);
      }
      // If require2FA — don't set auth yet, wait for 2FA verification
    },
  });
}
