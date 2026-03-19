import { api, passkeyRoutes } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { AuthResponse } from "@/types";
import { startAuthentication } from "@simplewebauthn/browser";
import { useMutation } from "@tanstack/react-query";

export function usePasskeyLogin() {
  const setAuth = useAuthStore((s) => s.setAuth);

  return useMutation({
    mutationFn: async (email?: string) => {
      // Get authentication options
      const url = email
        ? `${passkeyRoutes.authOptions()}?email=${encodeURIComponent(email)}`
        : passkeyRoutes.authOptions();
      const optionsRes = await api.get(url);
      const options = optionsRes.data.data;

      // Start browser authentication ceremony
      const response = await startAuthentication({ optionsJSON: options });

      // Verify with server
      const verifyRes = await api.post<AuthResponse>(
        passkeyRoutes.verifyAuth(),
        { response },
      );
      return verifyRes.data;
    },
    onSuccess: ({ data }) => {
      setAuth(data.user, data.accessToken);
    },
  });
}
