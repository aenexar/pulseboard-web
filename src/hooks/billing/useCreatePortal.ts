import { api } from "@/lib/api";
import { billingRoutes } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useCreatePortal(slug: string) {
  return useMutation({
    mutationFn: async (): Promise<string> => {
      const res = await api.post<{ success: boolean; data: { url: string } }>(
        billingRoutes.portal(slug),
      );
      return res.data.data.url;
    },
    onSuccess: (url) => {
      window.location.href = url;
    },
  });
}
