import { api, authRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useDismissOnboarding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await api.patch(authRoutes.dismissOnboarding());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["auth"] });
    },
  });
}
