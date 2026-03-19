import { api, passkeyRoutes } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type PasskeyItem = {
  id: string;
  name: string;
  deviceType: string;
  backedUp: boolean;
  lastUsedAt: string | null;
  createdAt: string;
};

export function usePasskeys() {
  return useQuery<PasskeyItem[]>({
    queryKey: ["passkeys"],
    queryFn: async () => {
      const res = await api.get(passkeyRoutes.list());
      return res.data.data;
    },
  });
}
