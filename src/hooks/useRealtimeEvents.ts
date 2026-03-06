import { socketManager } from "@/lib/SocketManager";
import { PulseEvent } from "@/types";
import { useEffect, useRef, useState } from "react";

export function useRealtimeEvents(projectId: string, maxEvents = 50) {
  const [events, setEvents] = useState<PulseEvent[]>([]);
  const [connected, setConnected] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const connectedRef = useRef(false);

  // Keep ref in sync with state
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

    const onSubscribed = ({ projectId: pid }: { projectId: string }) => {
      console.log(`[SocketManager] Subscribed to project: ${pid}`);
    };

    const onEvent = (data: PulseEvent) => {
      setEvents((prev) => [data, ...prev].slice(0, maxEvents));
    };

    const onDisconnect = () => updateConnected(false);
    const onConnectError = (err: Error) => {
      console.error("[SocketManager] Connection error:", err.message);
      updateConnected(false);
    };

    socketManager.on("connect", onConnect);
    socketManager.on("subscribed", onSubscribed);
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
      socketManager.off("subscribed", onSubscribed);
      socketManager.off("event", onEvent);
      socketManager.off("disconnect", onDisconnect);
      socketManager.off("connect_error", onConnectError);
      socketManager.disconnect();
      updateConnected(false);
    };
  }, [projectId, maxEvents, enabled]);

  const clearEvents = () => setEvents([]);
  const start = () => setEnabled(true);
  const stop = () => setEnabled(false);

  return { events, connected, enabled, start, stop, clearEvents };
}
