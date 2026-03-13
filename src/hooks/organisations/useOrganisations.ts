import { api, orgRoutes } from "@/lib/api";
import { Organisation } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useOrganisations() {
  return useQuery<Organisation[]>({
    queryKey: ["organisations"],
    queryFn: async () => {
      const res = await api.get(orgRoutes.list());
      return res.data.data;
    },
  });
}
