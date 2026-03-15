import { api, uploadRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUploadOrgLogo(slug: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post<{ success: boolean; data: { url: string } }>(
        uploadRoutes.orgLogo(slug),
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data.data.url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["organisations", slug] });
      queryClient.invalidateQueries({ queryKey: ["organisations"] });
    },
  });
}
