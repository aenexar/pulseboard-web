import { api, profileRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useChangePassword() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: {
      currentPassword?: string;
      newPassword: string;
    }) => {
      await api.patch(profileRoutes.changePassword(), payload);
    },
    onSuccess: () => {
      // Refresh profile so hasPassword updates
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    },
  });
}
