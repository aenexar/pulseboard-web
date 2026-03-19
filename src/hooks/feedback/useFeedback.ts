import { api, feedbackRoutes as routes } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type FeedbackItem = {
  id: string;
  type: "bug" | "feature" | "general";
  status: "open" | "in_progress" | "resolved" | "dismissed";
  message: string;
  meta: Record<string, unknown> | null;
  sessionId: string | null;
  appVersion: string | null;
  userEmail: string | null;
  userName: string | null;
  screenshotUrl: string | null;
  createdAt: string;
};

type FeedbackFilters = {
  type?: string;
  status?: string;
  page?: number;
};

export function useFeedback(
  slug: string,
  productSlug: string,
  projectId: string,
  filters: FeedbackFilters = {},
) {
  return useQuery({
    queryKey: ["feedback", slug, productSlug, projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.type) params.set("type", filters.type);
      if (filters.status) params.set("status", filters.status);
      if (filters.page) params.set("page", String(filters.page));

      const url = `${routes.list(slug, productSlug, projectId)}?${params}`;
      const res = await api.get(url);
      return res.data.data as {
        items: FeedbackItem[];
        total: number;
        page: number;
        hasMore: boolean;
      };
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
