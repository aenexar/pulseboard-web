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
  useLogout,
  useProfile,
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

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab() {
  const { data: profile, isLoading } = useProfile();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatarProfile();
  const user = useAuthStore((s) => s.user);

  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (profile) {
      timeout = setTimeout(() => {
        setName(profile.name);
      }, 0);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [profile]);

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
              onUpload={(file) => uploadAvatar.mutateAsync(file)}
              isUploading={uploadAvatar.isPending}
              size={80}
              shape="circle"
            />
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
          </div>

          {/* Email (read-only here) */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={profile?.email ?? ""}
              disabled
              className="text-muted-foreground"
            />
            <p className="text-xs text-muted-foreground">
              Change your email in the Security tab.
            </p>
          </div>
        </CardContent>
      </Card>

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
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab() {
  const changeEmail = useChangeEmail();
  const changePassword = useChangePassword();

  const [emailForm, setEmailForm] = useState({ email: "", password: "" });
  const [passForm, setPassForm] = useState({
    currentPassword: "",
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

  return (
    <div className="space-y-6">
      {/* Change Email */}
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

      {/* Change Password */}
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
                  setPassForm({ ...passForm, currentPassword: e.target.value })
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
                  setPassForm({ ...passForm, confirmPassword: e.target.value })
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
        <TabsList className="grid grid-cols-4 w-84">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
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
