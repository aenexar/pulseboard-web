import { socketManager } from "@/lib/SocketManager";
import { useEffect, useRef, useState } from "react";

type LiveLog = {
  id: string;
  level: "debug" | "info" | "warn" | "error";
  message: string;
  meta: Record<string, unknown> | null;
  sessionId: string | null;
  appVersion: string | null;
  timestamp: string;
  receivedAt: string;
};

export function useRealtimeLogs(projectId: string, maxLogs = 100) {
  const [logs, setLogs] = useState<LiveLog[]>([]);
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const connectedRef = useRef(false);

  const updateConnected = (value: boolean) => {
    connectedRef.current = value;
    setConnected(value);
  };

  useEffect(() => {
    if (!projectId || !enabled) {
      if (connectedRef.current) {
        socketManager.unsubscribeFromProject(projectId);
        socketManager.disconnect();
        setTimeout(() => updateConnected(false), 0);
      }
      return;
    }

    socketManager.connect();

    const onConnect = () => {
      updateConnected(true);
      socketManager.subscribeToProject(projectId);
    };

    const onEvent = (data: unknown) => {
      // Only handle log payloads
      const payload = data as Record<string, unknown>;
      if (payload.__type !== "log") return;

      setLogs((prev) =>
        [payload as unknown as LiveLog, ...prev].slice(0, maxLogs),
      );
    };

    const onDisconnect = () => updateConnected(false);
    const onConnectError = (err: Error) => {
      console.error("[RealtimeLogs] Connection error:", err.message);
      updateConnected(false);
    };

    socketManager.on("connect", onConnect);
    socketManager.on("event", onEvent);
    socketManager.on("disconnect", onDisconnect);
    socketManager.on("connect_error", onConnectError);

    if (socketManager.isConnected) {
      setTimeout(() => {
        updateConnected(true);
        socketManager.subscribeToProject(projectId);
      }, 0);
    }

    return () => {
      socketManager.unsubscribeFromProject(projectId);
      socketManager.off("connect", onConnect);
      socketManager.off("event", onEvent);
      socketManager.off("disconnect", onDisconnect);
      socketManager.off("connect_error", onConnectError);
      socketManager.disconnect();
      updateConnected(false);
    };
  }, [projectId, maxLogs, enabled]);

  const clearLogs = () => setLogs([]);
  const start = () => setEnabled(true);
  const stop = () => {
    setEnabled(false);
    setLogs([]);
  };

  return { logs, connected, enabled, start, stop, clearLogs };
}
