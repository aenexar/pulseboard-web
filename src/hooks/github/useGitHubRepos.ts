import { api, githubRoutes } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type GitHubRepo = {
  id: string;
  repoId: number;
  name: string;
  fullName: string;
  private: boolean;
  defaultBranch: string;
  url: string;
};

export function useGitHubRepos(slug: string) {
  return useQuery<GitHubRepo[]>({
    queryKey: ["github-repos", slug],
    queryFn: async () => {
      const res = await api.get(githubRoutes.repos(slug));
      return res.data.data;
    },
    enabled: !!slug,
  });
}
