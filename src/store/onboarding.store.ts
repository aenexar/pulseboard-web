import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Framework } from "@/types";

type OnboardingStore = {
  slug: string | null;
  productSlug: string | null;
  projectId: string | null;
  apiKey: string | null;
  framework: Framework | null;
  setProject: (
    slug: string,
    productSlug: string,
    projectId: string,
    apiKey: string,
    framework: Framework,
  ) => void;
  setProductSlug: (productSlug: string) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingStore>()(
  persist(
    (set) => ({
      slug: null,
      productSlug: null,
      projectId: null,
      apiKey: null,
      framework: null,

      setProject: (slug, productSlug, projectId, apiKey, framework) =>
        set({ slug, productSlug, projectId, apiKey, framework }),

      setProductSlug: (productSlug) => set({ productSlug }),

      reset: () =>
        set({
          slug: null,
          productSlug: null,
          projectId: null,
          apiKey: null,
          framework: null,
        }),
    }),
    { name: "pb-onboarding" },
  ),
);
