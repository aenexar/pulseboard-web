import { api } from "@/lib/api";
import { ApiResponse, Project } from "@/types";
import { useQuery } from "@tanstack/react-query";

export function useProjects() {
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<Project[]>>("/projects");
      return data.data;
    },
  });
}
