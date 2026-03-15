import { api, uploadRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUploadAvatar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (file: File): Promise<string> => {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post<{ success: boolean; data: { url: string } }>(
        uploadRoutes.avatar(),
        form,
        { headers: { "Content-Type": "multipart/form-data" } },
      );
      return res.data.data.url;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}
