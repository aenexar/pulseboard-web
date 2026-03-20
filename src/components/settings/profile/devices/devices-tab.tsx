import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useLogout,
  useRevokeAllAuditSessions,
  useRevokeAuditSession,
  useSessionAudit,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { Globe, LogOut, Monitor, Smartphone, Tablet } from "lucide-react";
import { StatusBadge } from "./status-badge";

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile") return <Smartphone className="w-5 h-5" />;
  if (device === "Tablet") return <Tablet className="w-5 h-5" />;
  return <Monitor className="w-5 h-5" />;
}

function formatDuration(minutes: number | null): string | null {
  if (minutes === null) return null;
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function DevicesTab() {
  const { data: groups, isLoading } = useSessionAudit();
  const revokeSession = useRevokeAuditSession();
  const revokeAll = useRevokeAllAuditSessions();
  const logout = useLogout();

  const hasActiveSessions =
    groups?.some((g) => g.sessions.some((s) => s.isActive && !s.isCurrent)) ??
    false;

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(2)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Session History</CardTitle>
              <CardDescription>
                All login sessions grouped by device. Last 90 days.
              </CardDescription>
            </div>
            {hasActiveSessions && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 shrink-0"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign out all others
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>
                      Sign out all other devices?
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                      All active sessions on other devices will be immediately
                      terminated.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => revokeAll.mutate()}
                      className="bg-destructive hover:bg-destructive/90 text-white"
                    >
                      Sign out all
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {groups?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No session history found.
            </p>
          )}

          {groups?.map((group) => (
            <div key={group.fingerprint} className="space-y-2">
              {/* Device header */}
              <div className="flex items-center gap-2 px-1">
                <DeviceIcon device={group.device ?? "Desktop"} />
                <span className="text-sm font-semibold text-foreground">
                  {group.browser} on {group.os}
                </span>
                {(group.city || group.country) && (
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Globe className="w-3 h-3" />
                    {[group.city, group.country].filter(Boolean).join(", ")}
                  </span>
                )}
              </div>

              {/* Sessions for this device */}
              <div className="space-y-1.5 pl-6 border-l border-border ml-2">
                {group.sessions.map((session) => (
                  <div
                    key={session.id}
                    className={cn(
                      "flex items-center justify-between gap-3 p-3 rounded-lg",
                      session.isCurrent
                        ? "bg-brand/5 border border-brand/20"
                        : "bg-card border border-border",
                    )}
                  >
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <div className="flex items-center gap-2 flex-wrap">
                        <StatusBadge status={session.status} />
                        {session.isCurrent && (
                          <Badge
                            variant="outline"
                            className="text-brand border-brand/30 text-xs"
                          >
                            This device
                          </Badge>
                        )}
                        {session.duration !== null && (
                          <span className="text-xs text-muted-foreground">
                            {formatDuration(session.duration)}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
                        <span>
                          Logged in{" "}
                          {new Date(session.loggedInAt).toLocaleString(
                            "en-US",
                            {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            },
                          )}
                        </span>
                        {session.loggedOutAt && (
                          <span>
                            → Logged out{" "}
                            {new Date(session.loggedOutAt).toLocaleString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              },
                            )}
                          </span>
                        )}
                        {session.isActive && !session.loggedOutAt && (
                          <div className="flex items-center gap-1 text-brand">
                            <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                            Active now
                          </div>
                        )}
                        {session.ipAddress && (
                          <span className="font-mono">{session.ipAddress}</span>
                        )}
                      </div>
                    </div>

                    {/* Revoke / Logout */}
                    {session.isCurrent ? (
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-muted-foreground hover:text-destructive shrink-0"
                          >
                            <LogOut className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>
                              Sign out of this device?
                            </AlertDialogTitle>
                            <AlertDialogDescription>
                              You will be signed out and redirected to the login
                              page.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => logout.mutate()}
                              className="bg-destructive hover:bg-destructive/90 text-white"
                            >
                              Sign out
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    ) : session.isActive ? (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => revokeSession.mutate(session.id)}
                        disabled={revokeSession.isPending}
                        className="text-muted-foreground hover:text-destructive shrink-0"
                      >
                        <LogOut className="w-4 h-4" />
                      </Button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
