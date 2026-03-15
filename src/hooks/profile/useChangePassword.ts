import { api, profileRoutes } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

export function useChangePassword() {
  return useMutation({
    mutationFn: async (payload: {
      currentPassword: string;
      newPassword: string;
    }) => {
      await api.patch(profileRoutes.changePassword(), payload);
    },
  });
}
