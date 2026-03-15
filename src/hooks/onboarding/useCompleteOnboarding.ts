import { api, authRoutes } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useCompleteOnboarding() {
  const queryClient = useQueryClient();
  const { user, updateUser } = useAuthStore();

  return useMutation({
    mutationFn: async () => {
      await api.patch(authRoutes.completeOnboarding());
    },
    onSuccess: () => {
      if (user) {
        updateUser({
          ...user,
          onboardingCompletedAt: new Date().toISOString(),
        });
      }
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}
