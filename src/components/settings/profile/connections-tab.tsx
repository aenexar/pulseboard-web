import { GitHubIcon } from "@/components/icons/github";
import { GoogleIcon } from "@/components/icons/google";
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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useConnections, useDisconnectProvider, useProfile } from "@/hooks";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

const API_URL = process.env.NEXT_PUBLIC_API_URL;

const PROVIDER_CONFIG = {
  github: {
    label: "GitHub",
    icon: GitHubIcon,
    color: "text-foreground",
    connectUrl: `${API_URL}/auth/github`,
  },
  google: {
    label: "Google",
    icon: GoogleIcon,
    color: "text-foreground",
    connectUrl: `${API_URL}/auth/google`,
  },
};

export function ConnectionsTab() {
  const { data: connections, isLoading } = useConnections();
  const disconnect = useDisconnectProvider();
  const { data: profile } = useProfile();

  const connectedProviders = new Set(connections?.map((c) => c.provider) ?? []);
  const hasPassword = !!profile?.hasPassword; // we'll add this to profile response

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Connected Accounts</CardTitle>
          <CardDescription>
            Sign in faster using your existing accounts. You can connect
            multiple providers.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {(
            Object.entries(PROVIDER_CONFIG) as [
              string,
              (typeof PROVIDER_CONFIG)[keyof typeof PROVIDER_CONFIG],
            ][]
          ).map(([provider, config]) => {
            const Icon = config.icon;
            const isConnected = connectedProviders.has(provider);
            const connection = connections?.find(
              (c) => c.provider === provider,
            );

            return (
              <div
                key={provider}
                className={cn(
                  "flex items-center justify-between p-4 rounded-lg border",
                  isConnected
                    ? "border-brand/30 bg-brand/5"
                    : "border-border bg-card",
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-5 h-5" />
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {config.label}
                    </p>
                    {isConnected && connection && (
                      <p className="text-xs text-muted-foreground">
                        Connected{" "}
                        {formatDistanceToNow(new Date(connection.createdAt), {
                          addSuffix: true,
                        })}
                      </p>
                    )}
                  </div>
                </div>
                {isConnected ? (
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        disabled={disconnect.isPending}
                      >
                        Disconnect
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>
                          Disconnect {config.label}?
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                          {!hasPassword && connectedProviders.size <= 1
                            ? "You must set a password in the Security tab before disconnecting your only sign-in method."
                            : `You will no longer be able to sign in with ${config.label}.`}
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        {(hasPassword || connectedProviders.size > 1) && (
                          <AlertDialogAction
                            onClick={() => disconnect.mutate(provider)}
                            className="bg-destructive hover:bg-destructive/90 text-white"
                          >
                            Disconnect
                          </AlertDialogAction>
                        )}
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                ) : (
                  <a href={config.connectUrl}>
                    <Button variant="outline" size="sm">
                      Connect
                    </Button>
                  </a>
                )}
              </div>
            );
          })}
        </CardContent>
      </Card>
    </div>
  );
}
