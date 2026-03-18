import { api, twoFactorRoutes } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type TwoFactorStatus = {
  enabled: boolean;
  enabledAt?: string;
  remainingRecoveryCodes: number;
};

export function useTwoFactorStatus() {
  return useQuery<TwoFactorStatus>({
    queryKey: ["2fa-status"],
    queryFn: async () => {
      const res = await api.get(twoFactorRoutes.status());
      return res.data.data;
    },
  });
}
