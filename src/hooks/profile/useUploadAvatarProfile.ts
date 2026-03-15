import { api, uploadRoutes } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUploadAvatarProfile() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

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
    onSuccess: (url) => {
      if (user) updateUser({ ...user, avatarUrl: url });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
