"use client";

import { PulseEvent } from "@/types";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

type Props = {
  events: PulseEvent[];
  connected: boolean;
};

const typeStyles: Record<string, string> = {
  error: "bg-destructive/10 text-destructive border-destructive/20",
  event: "bg-blue-500/10 text-blue-500 border-blue-500/20",
  metric:
    "bg-yellow-500/10 text-yellow-600 border-yellow-500/20 dark:text-yellow-400",
};

export function EventsFeed({ events, connected }: Props) {
  return (
    <div className="flex flex-col gap-2">
      {/* Connection status */}
      <div className="flex items-center gap-2 mb-2">
        <div
          className={cn(
            "w-2 h-2 rounded-full",
            connected ? "bg-brand animate-pulse" : "bg-muted-foreground/30",
          )}
        />
        <span className="text-xs font-mono text-muted-foreground">
          {connected ? "Live — receiving events" : "Disconnected"}
        </span>
      </div>

      {events.length === 0 && (
        <div className="text-center py-12 text-muted-foreground text-sm">
          No events yet. Send your first event using the API.
        </div>
      )}

      {events.map((event) => (
        <div
          key={event.id}
          className={cn(
            "flex items-start gap-3 p-3 rounded-md",
            "bg-card border border-border",
            "animate-in fade-in slide-in-from-top-2 duration-300",
          )}
        >
          <Badge
            variant="outline"
            className={cn(
              "text-xs font-mono shrink-0 mt-0.5",
              typeStyles[event.type],
            )}
          >
            {event.type}
          </Badge>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground truncate">
              {event.name}
            </p>
            <p className="text-xs text-muted-foreground font-mono mt-0.5">
              {new Date(event.receivedAt).toLocaleTimeString()}
            </p>
          </div>
          <pre className="text-xs text-muted-foreground max-w-xs truncate hidden md:block">
            {JSON.stringify(event.payload)}
          </pre>
        </div>
      ))}
    </div>
  );
}
