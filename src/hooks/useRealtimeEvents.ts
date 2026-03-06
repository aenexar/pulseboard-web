import { socketManager } from "@/lib/SocketManager";
import { PulseEvent } from "@/types";
import { useEffect, useState } from "react";

export function useRealtimeEvents(projectId: string, maxEvents = 50) {
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (!projectId || !enabled) {
      // Disconnect if disabled
      if (!enabled && connected) {
        socketManager.unsubscribeFromProject(projectId);
        socketManager.disconnect();
        setTimeout(() => setConnected(false), 0);
      }
      return;
    }

    socketManager.connect();

    const onConnect = () => {
      setConnected(true);
      socketManager.subscribeToProject(projectId);
    };

    const onSubscribed = ({ projectId: pid }: { projectId: string }) => {
      console.log(`[SocketManager] Subscribed to project: ${pid}`);
    };

    const onEvent = (data: PulseEvent) => {
      setEvents((prev) => [data, ...prev].slice(0, maxEvents));
    };

    const onDisconnect = () => setConnected(false);
    const onConnectError = (err: Error) => {
      console.error("[SocketManager] Connection error:", err.message);
      setConnected(false);
    };

    socketManager.on("connect", onConnect);
    socketManager.on("subscribed", onSubscribed);
    socketManager.on("event", onEvent);
    socketManager.on("disconnect", onDisconnect);
    socketManager.on("connect_error", onConnectError);

    if (socketManager.isConnected) {
      setTimeout(() => {
        setConnected(true);
        socketManager.subscribeToProject(projectId);
      }, 0);
    }

    return () => {
      socketManager.unsubscribeFromProject(projectId);
      socketManager.off("connect", onConnect);
      socketManager.off("subscribed", onSubscribed);
      socketManager.off("event", onEvent);
      socketManager.off("disconnect", onDisconnect);
      socketManager.off("connect_error", onConnectError);
      socketManager.disconnect();
      setConnected(false);
    };
  }, [projectId, maxEvents, enabled]);

  const clearEvents = () => setEvents([]);
  const start = () => setEnabled(true);
  const stop = () => setEnabled(false);

  return { events, connected, enabled, start, stop, clearEvents };
}
