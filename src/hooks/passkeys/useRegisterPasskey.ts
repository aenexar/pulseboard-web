import { api, passkeyRoutes } from "@/lib/api";
import { startRegistration } from "@simplewebauthn/browser";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useRegisterPasskey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (name: string) => {
      // Get registration options from server
      const optionsRes = await api.get(passkeyRoutes.registrationOptions());
      const options = optionsRes.data.data;

      // Start browser registration ceremony
      const response = await startRegistration({ optionsJSON: options });

      // Verify with server
      const verifyRes = await api.post(passkeyRoutes.verifyRegistration(), {
        response,
        name,
      });
      return verifyRes.data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["passkeys"] });
    },
  });
}
