import { api, connectionRoutes } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type OAuthConnection = {
  id: string;
  provider: string;
  createdAt: string;
};

export function useConnections() {
  return useQuery<OAuthConnection[]>({
    queryKey: ["connections"],
    queryFn: async () => {
      const res = await api.get(connectionRoutes.list());
      return res.data.data;
    },
  });
}
