import { api, analyticsRoutes } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type SparklineData = Record<string, { date: string; count: number }[]>;

export function useSparklines(slug: string, productSlug: string) {
  return useQuery<SparklineData>({
    queryKey: ["sparklines", slug, productSlug],
    queryFn: async () => {
      const res = await api.get(analyticsRoutes.sparklines(slug, productSlug));
      return res.data.data;
    },
    enabled: !!slug && !!productSlug,
  });
}
