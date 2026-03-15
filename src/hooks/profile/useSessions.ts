import { api, profileRoutes } from "@/lib/api";
import { Device } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useSessions() {
  return useQuery({
    queryKey: ["sessions"],
    queryFn: async (): Promise<Device[]> => {
      const res = await api.get<{ success: boolean; data: Device[] }>(
        profileRoutes.sessions(),
      );
      return res.data.data;
    },
  });
}
