"use client";

import { UserActivityItem } from "@/components/activity/activity-item";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LogoUpload } from "@/components/upload/logo-upload";
import {
  useChangeEmail,
  useChangePassword,
  useConnections,
  useDisconnectProvider,
  useLogout,
  useProfile,
  useRefreshProvider,
  useRevokeAllSessions,
  useRevokeSession,
  useSessions,
  useUpdateProfile,
  useUploadAvatarProfile,
  useUserActivity,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { Device } from "@/types";
import { formatDistanceToNow } from "date-fns";
import {
  AlertTriangle,
  CheckCircle2,
  Globe,
  LogOut,
  Monitor,
  Save,
  Shield,
  Smartphone,
  Tablet,
} from "lucide-react";
import { useEffect, useState } from "react";

// ─── Device icon ──────────────────────────────────────────────────────────────

function DeviceIcon({ device }: { device: string }) {
  if (device === "Mobile") return <Smartphone className="w-5 h-5" />;
  if (device === "Tablet") return <Tablet className="w-5 h-5" />;
  return <Monitor className="w-5 h-5" />;
}

// ─── Device Card ──────────────────────────────────────────────────────────────

function DeviceCard({
  session,
  onRevoke,
  isRevoking,
}: {
  session: Device;
  onRevoke: (id: string) => void;
  isRevoking: boolean;
}) {
  const logout = useLogout();

  return (
    <div
      className={cn(
        "flex items-start gap-4 p-4 rounded-xl border transition-colors",
        session.isCurrent
          ? "border-brand/30 bg-brand/5"
          : "border-border bg-card",
      )}
    >
      <div
        className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          session.isCurrent
            ? "bg-brand/10 text-brand"
            : "bg-muted text-muted-foreground",
        )}
      >
        <DeviceIcon device={session.device} />
      </div>

      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center gap-2 flex-wrap">
          <p className="text-sm font-semibold text-foreground">
            {session.browser} on {session.os}
          </p>
          {session.isCurrent && (
            <Badge
              variant="outline"
              className="text-brand border-brand/30 text-xs"
            >
              This device
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
          <span>{session.device}</span>
          {(session.city || session.country) && (
            <div className="flex items-center gap-1">
              <Globe className="w-3 h-3" />
              <span>
                {[session.city, session.country].filter(Boolean).join(", ")}
              </span>
            </div>
          )}
          {session.isCurrent ? (
            <div className="flex items-center gap-1 text-brand">
              <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
              <span>Active now</span>
            </div>
          ) : (
            <span>
              Active{" "}
              {formatDistanceToNow(new Date(session.lastActiveAt), {
                addSuffix: true,
              })}
            </span>
          )}
        </div>
      </div>

      {/* Other session — simple revoke */}
      {!session.isCurrent && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onRevoke(session.id)}
          disabled={isRevoking}
          className="text-destructive hover:text-destructive hover:bg-destructive/10 shrink-0"
        >
          <LogOut className="w-4 h-4" />
        </Button>
      )}

      {/* Current session — confirm before signing out */}
      {session.isCurrent && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Sign out of this device?</AlertDialogTitle>
              <AlertDialogDescription>
                You will be signed out of your current session and redirected to
                the login page.
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
      )}
    </div>
  );
}

// ─── General Tab ─────────────────────────────────────────────────────────────

function GeneralTab() {
  const { data: profile, isLoading } = useProfile();
  const { data: connections } = useConnections();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatarProfile();
  const user = useAuthStore((s) => s.user);
  const refreshProvider = useRefreshProvider();

  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  const isOAuthOnly = !profile?.hasPassword && (connections?.length ?? 0) > 0;
  const connectedWith = connections?.[0]?.provider;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (profile) {
      timeout = setTimeout(() => setName(profile.name), 0);
    }
    return () => clearTimeout(timeout);
  }, [profile]);

  // Refresh name/avatar from provider
  const handleRefresh = () => refreshProvider.mutate();

  const handleSave = async () => {
    if (!name.trim()) return;
    await updateProfile.mutateAsync(name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your public profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <LogoUpload
              currentUrl={user?.avatarUrl}
              fallback={user?.name ?? ""}
              onUpload={
                isOAuthOnly
                  ? undefined
                  : (file) => uploadAvatar.mutateAsync(file)
              }
              isUploading={uploadAvatar.isPending}
              size={80}
              shape="circle"
              disabled={isOAuthOnly}
            />
          </div>

          {/* OAuth notice */}
          {isOAuthOnly && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
              <p className="text-sm text-muted-foreground">
                Profile synced from{" "}
                <span className="font-medium capitalize text-foreground">
                  {connectedWith}
                </span>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshProvider.isPending}
              >
                {refreshProvider.isPending ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={isOAuthOnly}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={profile?.email ?? ""}
              disabled
              className="text-muted-foreground"
            />
            {!isOAuthOnly && (
              <p className="text-xs text-muted-foreground">
                Change your email in the Security tab.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {!isOAuthOnly && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={!name.trim() || updateProfile.isPending}
            className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-brand">
              <CheckCircle2 className="w-4 h-4" />
              Saved
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const { data: profile } = useProfile();
  const { data: connections } = useConnections();
  const changeEmail = useChangeEmail();
  const changePassword = useChangePassword();

  const isOAuthOnly = !profile?.hasPassword && (connections?.length ?? 0) > 0;
  const hasPassword = !!profile?.hasPassword;

  const [emailForm, setEmailForm] = useState({ email: "", password: "" });
  const [passForm, setPassForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [newPassForm, setNewPassForm] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [emailSaved, setEmailSaved] = useState(false);
  const [passSaved, setPassSaved] = useState(false);

  const handleEmailChange = async (e: React.FormEvent) => {
    e.preventDefault();
    await changeEmail.mutateAsync(emailForm);
    setEmailForm({ email: "", password: "" });
    setEmailSaved(true);
    setTimeout(() => setEmailSaved(false), 3000);
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passForm.newPassword !== passForm.confirmPassword) return;
    await changePassword.mutateAsync({
      currentPassword: passForm.currentPassword,
      newPassword: passForm.newPassword,
    });
    setPassForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
    setPassSaved(true);
    setTimeout(() => setPassSaved(false), 3000);
  };

  const passwordMismatch =
    passForm.confirmPassword.length > 0 &&
    passForm.newPassword !== passForm.confirmPassword;

  const newPasswordMismatch =
    newPassForm.confirmPassword.length > 0 &&
    newPassForm.newPassword !== newPassForm.confirmPassword;

  return (
    <div className="space-y-6">
      {/* Change Email — only for email/password users */}
      {!isOAuthOnly && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-base">Change Email</CardTitle>
            </div>
            <CardDescription>
              Confirm your password to update your email address.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleEmailChange} className="space-y-4">
              <div className="space-y-2">
                <Label>New Email</Label>
                <Input
                  type="email"
                  placeholder="new@example.com"
                  value={emailForm.email}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, email: e.target.value })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={emailForm.password}
                  onChange={(e) =>
                    setEmailForm({ ...emailForm, password: e.target.value })
                  }
                  required
                />
              </div>
              {changeEmail.isError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {changeEmail.error instanceof Error
                    ? changeEmail.error.message
                    : "Failed to update email"}
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={changeEmail.isPending}
                  className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
                >
                  {changeEmail.isPending ? "Updating..." : "Update Email"}
                </Button>
                {emailSaved && (
                  <div className="flex items-center gap-1.5 text-sm text-brand">
                    <CheckCircle2 className="w-4 h-4" />
                    Updated
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Set Password — OAuth-only users */}
      {isOAuthOnly && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-base">Set a Password</CardTitle>
            </div>
            <CardDescription>
              Add a password so you can sign in with email too.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={newPassForm.newPassword}
                  onChange={(e) =>
                    setNewPassForm({
                      ...newPassForm,
                      newPassword: e.target.value,
                    })
                  }
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat password"
                  value={newPassForm.confirmPassword}
                  onChange={(e) =>
                    setNewPassForm({
                      ...newPassForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className={newPasswordMismatch ? "border-destructive" : ""}
                />
                {newPasswordMismatch && (
                  <p className="text-xs text-destructive">
                    Passwords do not match
                  </p>
                )}
              </div>
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={!newPassForm.newPassword || newPasswordMismatch}
                  className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
                >
                  Set Password
                </Button>
                {passSaved && (
                  <div className="flex items-center gap-1.5 text-sm text-brand">
                    <CheckCircle2 className="w-4 h-4" />
                    Password set
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {/* Change Password — email/password users only */}
      {hasPassword && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-base">Change Password</CardTitle>
            </div>
            <CardDescription>
              Use a strong password with at least 8 characters.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="space-y-4">
              <div className="space-y-2">
                <Label>Current Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={passForm.currentPassword}
                  onChange={(e) =>
                    setPassForm({
                      ...passForm,
                      currentPassword: e.target.value,
                    })
                  }
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>New Password</Label>
                <Input
                  type="password"
                  placeholder="Min. 8 characters"
                  value={passForm.newPassword}
                  onChange={(e) =>
                    setPassForm({ ...passForm, newPassword: e.target.value })
                  }
                  minLength={8}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Confirm New Password</Label>
                <Input
                  type="password"
                  placeholder="Repeat new password"
                  value={passForm.confirmPassword}
                  onChange={(e) =>
                    setPassForm({
                      ...passForm,
                      confirmPassword: e.target.value,
                    })
                  }
                  required
                  className={passwordMismatch ? "border-destructive" : ""}
                />
                {passwordMismatch && (
                  <p className="text-xs text-destructive">
                    Passwords do not match
                  </p>
                )}
              </div>
              {changePassword.isError && (
                <div className="flex items-center gap-2 text-sm text-destructive">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  Current password is incorrect
                </div>
              )}
              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={
                    changePassword.isPending ||
                    passwordMismatch ||
                    !passForm.currentPassword ||
                    !passForm.newPassword
                  }
                  className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
                >
                  {changePassword.isPending ? "Updating..." : "Update Password"}
                </Button>
                {passSaved && (
                  <div className="flex items-center gap-1.5 text-sm text-brand">
                    <CheckCircle2 className="w-4 h-4" />
                    Updated
                  </div>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
// ─── Devices Tab ──────────────────────────────────────────────────────────────

function DevicesTab() {
  const { data: sessions, isLoading } = useSessions();
  const revokeSession = useRevokeSession();
  const revokeAll = useRevokeAllSessions();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-20" />
        ))}
      </div>
    );
  }

  const otherSessions = sessions?.filter((s) => !s.isCurrent) ?? [];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base">Active Sessions</CardTitle>
              <CardDescription>
                Devices currently signed in to your account.
              </CardDescription>
            </div>
            {otherSessions.length > 0 && (
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
                      This will immediately sign out all other active sessions.
                      You will remain signed in on this device.
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
        <CardContent className="space-y-3">
          {sessions?.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No active sessions found.
            </p>
          )}
          {sessions?.map((session) => (
            <DeviceCard
              key={session.id}
              session={session}
              onRevoke={(id) => revokeSession.mutate(id)}
              isRevoking={revokeSession.isPending}
            />
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Activity Tab ──────────────────────────────────────────────────────────────

function ActivityTab() {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useUserActivity(page);

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[...Array(6)].map((_, i) => (
          <Skeleton key={i} className="h-14" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Account Activity</CardTitle>
          <CardDescription>
            A log of all actions taken on your account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data?.items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No activity recorded yet.
            </p>
          ) : (
            <div className="divide-y divide-border">
              {data?.items.map((item) => (
                <UserActivityItem key={item.id} item={item} />
              ))}
            </div>
          )}

          {(data?.hasMore || page > 1) && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
              >
                Previous
              </Button>
              <span className="text-sm text-muted-foreground">Page {page}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => p + 1)}
                disabled={!data?.hasMore}
              >
                Next
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Connected Accounts Tab ───────────────────────────────────────────────────

function GitHubIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
    </svg>
  );
}

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}

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

function ConnectionsTab() {
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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ProfilePage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal account settings
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-5 w-full">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="connections">Connections</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="general">
            <GeneralTab />
          </TabsContent>
          <TabsContent value="security">
            <SecurityTab />
          </TabsContent>
          <TabsContent value="connections">
            <ConnectionsTab />
          </TabsContent>
          <TabsContent value="devices">
            <DevicesTab />
          </TabsContent>
          <TabsContent value="activity">
            <ActivityTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
