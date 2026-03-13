import { api, publicRoutes } from "@/lib/api";
import { useMutation } from "@tanstack/react-query";

type SubscribeResponse = {
  success: boolean;
  message: "Successfully subscribed" | "Already subscribed";
};

export function useNewsletterSubscribe() {
  return useMutation({
    mutationFn: async (payload: {
      email: string;
      source?: string;
    }): Promise<SubscribeResponse> => {
      const res = await api.post<SubscribeResponse>(
        publicRoutes.newsletterSubscribe(),
        payload,
      );
      return res.data;
    },
  });
}
