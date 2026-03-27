import { create } from "zustand";
import { persist } from "zustand/middleware";

type EnvironmentStore = {
  environments: Record<string, string | null>; // projectId → environment
  setEnvironment: (projectId: string, env: string | null) => void;
  getEnvironment: (projectId: string) => string | null;
};

export const useEnvironmentStore = create<EnvironmentStore>()(
  persist(
    (set, get) => ({
      environments: {},
      setEnvironment: (projectId, env) =>
        set((s) => ({
          environments: { ...s.environments, [projectId]: env },
        })),
      getEnvironment: (projectId) => get().environments[projectId] ?? null,
    }),
    { name: "pb-environments" },
  ),
);
