import { api, productRoutes } from "@/lib/api";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useProducts(slug: string) {
  return useQuery<Product[]>({
    queryKey: ["products", slug],
    queryFn: async () => {
      const res = await api.get(productRoutes.list(slug));
      return res.data.data;
    },
    enabled: !!slug,
  });
}
