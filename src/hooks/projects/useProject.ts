import { api, projectRoutes } from "@/lib/api";
import { Project } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useProject(slug: string, productSlug: string, id: string) {
  return useQuery<Project>({
    queryKey: ["projects", slug, productSlug, id],
    queryFn: async () => {
      const res = await api.get(projectRoutes.get(slug, productSlug, id));
      return res.data.data;
    },
    enabled: !!slug && !!productSlug && !!id,
  });
}
