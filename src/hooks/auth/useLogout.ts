import { api } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";
import { socketManager } from "@/lib/SocketManager";
import { useAuthStore } from "@/store/auth.store";
import { useOnboardingStore } from "@/store/onboarding.store";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "next/navigation";

export function useLogout() {
  const router = useRouter();
  const clearAuth = useAuthStore((s) => s.clearAuth);
  const resetOnboarding = useOnboardingStore((s) => s.reset);

  return useMutation({
    mutationFn: async () => {
      await api.post("/auth/logout");
    },
    onSuccess: () => {
      socketManager.disconnect();
      clearAuth();
      resetOnboarding();
      queryClient.clear();
      router.replace("/login");
    },
    onError: () => {
      socketManager.disconnect();
      clearAuth();
      resetOnboarding();
      queryClient.clear();
      router.replace("/login");
    },
  });
}
