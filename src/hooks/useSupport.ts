import { api, publicRoutes } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

type ContactPayload = {
  name: string;
  email: string;
  subject: string;
  message: string;
};

export function useSupportContact() {
  return useMutation({
    mutationFn: async (payload: ContactPayload) => {
      await api.post(publicRoutes.supportContact(), payload);
    },
  });
}
