import { api, passwordResetRoutes } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

export function useValidateResetToken(token: string) {
  return useQuery({
    queryKey: ["reset-token", token],
    queryFn: async () => {
      await api.get(passwordResetRoutes.validate(token));
      return true;
    },
    enabled: !!token,
    retry: false,
    staleTime: Infinity, // token validity doesn't change during the session
  });
}
