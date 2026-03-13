import { api, projectRoutes } from "@/lib/api";
import { Project } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useProject(slug: string, id: string) {
  return useQuery<Project>({
    queryKey: ["projects", slug, id],
    queryFn: async () => {
      const res = await api.get(projectRoutes.get(slug, id));
      return res.data.data;
    },
    enabled: !!slug && !!id,
  });
}
