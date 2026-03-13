import { api, orgRoutes } from "@/lib/api";
import { Organisation } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useOrganisation(slug: string) {
  return useQuery<Organisation>({
    queryKey: ["organisations", slug],
    queryFn: async () => {
      const res = await api.get(orgRoutes.get(slug));
      return res.data.data;
    },
    enabled: !!slug,
  });
}
