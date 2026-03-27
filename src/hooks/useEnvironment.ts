import { useEnvironmentStore } from "@/store/environment.store";
import { useParams } from "next/navigation";
import { useCallback } from "react";

export function useEnvironment() {
  const params = useParams();
  const projectId = params?.id as string;

  const environment = useEnvironmentStore(
    (s) => s.environments[projectId] ?? null,
  );
  const setEnvironment = useEnvironmentStore((s) => s.setEnvironment);

  const set = useCallback(
    (env: string | null) => setEnvironment(projectId, env),
    [projectId, setEnvironment],
  );

  return { environment, setEnvironment: set };
}
