import { api, sessionAuditRoutes } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

type AuditSession = {
  id: string;
  refreshTokenId: string | null;
  browser: string | null;
  os: string | null;
  device: string | null;
  ipAddress: string | null;
  city: string | null;
  country: string | null;
  loggedInAt: string;
  loggedOutAt: string | null;
  lastActiveAt: string;
  expiresAt: string;
  isActive: boolean;
  isCurrent: boolean;
  status: "active" | "logged_out" | "expired";
  duration: number | null; // minutes
};

type DeviceGroup = {
  fingerprint: string;
  browser: string | null;
  os: string | null;
  device: string | null;
  city: string | null;
  country: string | null;
  sessions: AuditSession[];
};

export function useSessionAudit() {
  return useQuery<DeviceGroup[]>({
    queryKey: ["session-audit"],
    queryFn: async () => {
      const res = await api.get(sessionAuditRoutes.list());
      return res.data.data;
    },
  });
}
