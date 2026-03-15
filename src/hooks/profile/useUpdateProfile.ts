import { api, profileRoutes } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useUpdateProfile() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async (name: string) => {
      await api.patch(profileRoutes.update(), { name });
    },
    onSuccess: (_, name) => {
      if (user) updateUser({ ...user, name });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
