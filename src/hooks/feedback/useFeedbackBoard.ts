import { api, feedbackRoutes } from "@/lib/api";
import { FeedbackItem, FeedbackStatus } from "@/types";
import { useQuery } from "@tanstack/react-query";

const STATUSES: FeedbackStatus[] = [
  "open",
  "in_progress",
  "resolved",
  "dismissed",
];

async function fetchColumn(
  slug: string,
  productSlug: string,
  projectId: string,
  status: FeedbackStatus,
  type?: string,
): Promise<FeedbackItem[]> {
  const p = new URLSearchParams({ status, limit: "50" });
  if (type) p.set("type", type);
  const res = await api.get(
    `${feedbackRoutes.list(slug, productSlug, projectId)}?${p}`,
  );
  return res.data.data.items;
}

export function useFeedbackBoard(
  slug: string,
  productSlug: string,
  projectId: string,
  typeFilter?: string,
) {
  return useQuery<Record<FeedbackStatus, FeedbackItem[]>>({
    queryKey: ["feedback-board", slug, productSlug, projectId, typeFilter],
    queryFn: async () => {
      const results = await Promise.all(
        STATUSES.map((s) =>
          fetchColumn(slug, productSlug, projectId, s, typeFilter),
        ),
      );
      return Object.fromEntries(
        STATUSES.map((s, i) => [s, results[i]]),
      ) as Record<FeedbackStatus, FeedbackItem[]>;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
