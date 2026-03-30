import { api, documentRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDeleteDocument(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (documentId: string) => {
      await api.delete(documentRoutes.delete(slug, documentId));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["documents", slug] });
    },
  });
}
