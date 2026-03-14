import { Framework } from "@/types";
import { create } from "zustand";
import { persist } from "zustand/middleware";

type OnboardingState = {
  slug: string | null;
  projectId: string | null;
  apiKey: string | null;
  framework: Framework | null;
  setProject: (
    slug: string,
    projectId: string,
    apiKey: string,
    framework: Framework,
  ) => void;
  reset: () => void;
};

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set) => ({
      slug: null,
      projectId: null,
      apiKey: null,
      framework: null,
      setProject: (slug, projectId, apiKey, framework) =>
        set({ slug, projectId, apiKey, framework }),
      reset: () =>
        set({ slug: null, projectId: null, apiKey: null, framework: null }),
    }),
    { name: "pb-onboarding" },
  ),
);
