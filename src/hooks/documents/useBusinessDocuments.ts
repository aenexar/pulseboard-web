import { api, documentRoutes } from "@/lib/api";
import { BusinessDocument } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useBusinessDocuments(slug: string) {
  return useQuery<BusinessDocument[]>({
    queryKey: ["documents", slug],
    queryFn: async () => {
      const res = await api.get(documentRoutes.list(slug));
      return res.data.data;
    },
    enabled: !!slug,
  });
}
