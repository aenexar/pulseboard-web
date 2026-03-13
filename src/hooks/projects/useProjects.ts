import { api, projectRoutes } from "@/lib/api";
import { Project } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useProjects(slug: string) {
  return useQuery<Project[]>({
    queryKey: ["projects", slug],
    queryFn: async () => {
      const res = await api.get(projectRoutes.list(slug));
      return res.data.data;
    },
    enabled: !!slug,
  });
}
