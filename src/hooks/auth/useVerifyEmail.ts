import { api } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useVerifyEmail(token: string) {
  return useQuery({
    queryKey: ["verify-email", token],
    queryFn: async () => {
      await api.get(`/auth/verify-email?token=${token}`);
      return true;
    },
    enabled: !!token,
    retry: false,
    staleTime: Infinity,
  });
}
