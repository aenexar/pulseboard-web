import { api, profileRoutes } from "@/lib/api";
import { User } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useProfile() {
  return useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<User> => {
      const res = await api.get<{ success: boolean; data: User }>(
        profileRoutes.get(),
      );
      return res.data.data;
    },
  });
}
