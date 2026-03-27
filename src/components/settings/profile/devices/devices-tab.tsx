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
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <CardTitle className="text-base">Active Devices</CardTitle>
              <CardDescription>
                Devices where you are currently signed in.
              </CardDescription>
            </div>
            {hasActiveSessions && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive border-destructive/30 hover:bg-destructive/10 gap-2"
                  >
                    <LogOut className="w-4 h-4" />
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

        <CardContent className="space-y-2">
          {groups?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active devices found.
            </p>
          )}

          {groups?.map((group) => {
            // Show only the most recent session for this device
            const latest = group.sessions[0];
            if (!latest) return null;

            return (
              <div
                key={group.fingerprint}
                className={cn(
                  "flex items-center justify-between gap-3 p-3 rounded-lg border",
                  latest.isCurrent
                    ? "bg-brand/5 border-brand/20"
                    : "bg-card border-border",
                )}
              >
                {/* Device info */}
                <div className="flex items-center gap-3 min-w-0">
                  <div className="text-muted-foreground shrink-0">
                    <DeviceIcon device={group.device ?? "Desktop"} />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium text-foreground">
                        {group.browser} on {group.os}
                      </span>
                      {latest.isCurrent && (
                        <Badge
                          variant="outline"
                          className="text-brand border-brand/30 text-xs"
                        >
                          This device
                        </Badge>
                      )}
                      {latest.isActive && !latest.isCurrent && (
                        <div className="flex items-center gap-1 text-xs text-brand">
                          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
                          Active
                        </div>
                      )}
                    </div>
                    {(group.city || group.country) && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1 mt-0.5">
                        <Globe className="w-3 h-3" />
                        {[group.city, group.country].filter(Boolean).join(", ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Action */}
                {latest.isCurrent ? (
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
                ) : latest.isActive ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => revokeSession.mutate(latest.id)}
                    disabled={revokeSession.isPending}
                    className="text-muted-foreground hover:text-destructive shrink-0"
                  >
                    <LogOut className="w-4 h-4" />
                  </Button>
                ) : null}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
