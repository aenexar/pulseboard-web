import { api, logRoutes } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type LogItem = {
  id: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  meta: Record<string, unknown> | null;
  sessionId: string | null;
  appVersion: string | null;
  timestamp: string;
  receivedAt: string;
};

type LogsResponse = {
  items: LogItem[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
};

type LogFilters = {
  level?: string;
  sessionId?: string;
  search?: string;
  page?: number;
};

export function useLogs(
  slug: string,
  productSlug: string,
  projectId: string,
  filters: LogFilters = {},
) {
  return useQuery<LogsResponse>({
    queryKey: ["logs", slug, productSlug, projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.level) params.set("level", filters.level);
      if (filters.sessionId) params.set("sessionId", filters.sessionId);
      if (filters.search) params.set("search", filters.search);
      if (filters.page) params.set("page", String(filters.page));

      const url = `${logRoutes.list(slug, productSlug, projectId)}?${params}`;
      const res = await api.get(url);
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
