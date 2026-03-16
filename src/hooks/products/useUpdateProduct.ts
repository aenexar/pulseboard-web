import { api, productRoutes } from "@/lib/api";
import { Product } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProduct(slug: string, productSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name?: string;
      description?: string;
      slug?: string;
      logoUrl?: string;
    }): Promise<Product> => {
      const res = await api.patch(
        productRoutes.update(slug, productSlug),
        data,
      );
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", slug] });
      queryClient.invalidateQueries({
        queryKey: ["products", slug, productSlug],
      });
    },
  });
}
