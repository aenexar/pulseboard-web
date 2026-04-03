import { api, feedbackRoutes } from "@/lib/api";
import { ProjectMember } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useProjectFeedbackMembers(
  slug: string,
  productSlug: string,
  projectId: string,
) {
  return useQuery<ProjectMember[]>({
    queryKey: ["feedback-members", slug, productSlug, projectId],
    queryFn: async () => {
      const res = await api.get(
        feedbackRoutes.members(slug, productSlug, projectId),
      );
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!projectId,
  });
}
