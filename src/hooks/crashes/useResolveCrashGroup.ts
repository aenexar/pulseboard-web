import { api, crashRoutes } from "@/lib/api";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export function useResolveCrashGroup(
  slug: string,
  productSlug: string,
  projectId: string,
  crashGroupId: string,
) {
  const queryClient = useQueryClient();

  const invalidate = () => {
    queryClient.invalidateQueries({
      queryKey: ["crashes", slug, productSlug, projectId],
    });
    queryClient.invalidateQueries({
      queryKey: ["crash", slug, productSlug, projectId, crashGroupId],
    });
  };

  const resolve = useMutation({
    mutationFn: () =>
      api.patch(
        crashRoutes.resolve(slug, productSlug, projectId, crashGroupId),
      ),
    onSuccess: invalidate,
  });

  const unresolve = useMutation({
    mutationFn: () =>
      api.patch(
        crashRoutes.unresolve(slug, productSlug, projectId, crashGroupId),
      ),
    onSuccess: invalidate,
  });

  return { resolve, unresolve };
}
