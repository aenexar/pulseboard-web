import { api, projectRoutes } from "@/lib/api";
import { Project } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useProjects(slug: string, productSlug: string) {
  return useQuery<Project[]>({
    queryKey: ["projects", slug, productSlug],
    queryFn: async () => {
      const res = await api.get(projectRoutes.list(slug, productSlug));
      return res.data.data;
    },
    enabled: !!slug && !!productSlug,
  });
}
