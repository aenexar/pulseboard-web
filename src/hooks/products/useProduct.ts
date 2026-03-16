import { api, productRoutes } from "@/lib/api";
import { Product } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useProduct(slug: string, productSlug: string) {
  return useQuery<Product>({
    queryKey: ["products", slug, productSlug],
    queryFn: async () => {
      const res = await api.get(productRoutes.get(slug, productSlug));
      return res.data.data;
    },
    enabled: !!slug && !!productSlug,
  });
}
