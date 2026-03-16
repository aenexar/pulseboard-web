import { api, productRoutes } from "@/lib/api";
import { Product } from "@/types";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCreateProduct(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
    }): Promise<Product> => {
      const res = await api.post(productRoutes.create(slug), data);
      return res.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", slug] });
    },
  });
}
