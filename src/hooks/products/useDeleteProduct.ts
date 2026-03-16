import { api, productRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteProduct(slug: string, productSlug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.delete(productRoutes.delete(slug, productSlug));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products", slug] });
    },
  });
}
