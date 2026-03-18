import { api, twoFactorRoutes } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

type TwoFactorSetup = {
  secret: string;
  qrCodeUrl: string;
  qrCode: string;
};

export function useGenerateTwoFactorSetup() {
  return useMutation({
    mutationFn: async (): Promise<TwoFactorSetup> => {
      const res = await api.post(twoFactorRoutes.setup());
      return res.data.data;
    },
  });
}
