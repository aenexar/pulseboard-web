import { api } from "@/lib/api";
import { ApiResponse, Project } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useProject(id: string) {
  return useQuery({
    queryKey: ["projects", id],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project>>(`/projects/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}
