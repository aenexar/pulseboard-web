import { api, profileRoutes } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useChangeEmail() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async (payload: { email: string; password: string }) => {
      await api.patch(profileRoutes.changeEmail(), payload);
    },
    onSuccess: (_, { email }) => {
      if (user) updateUser({ ...user, email });
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
