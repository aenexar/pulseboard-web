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
import {
  useChangeEmail,
  useChangePassword,
  useConnections,
  useProfile,
} from "@/hooks";
import { AlertTriangle, CheckCircle2, Shield } from "lucide-react";
import { useState } from "react";
import { PasskeysSection } from "./passkeys-section";
import { TwoFactorSection } from "./two-factor-section";

export function SecurityTab() {
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
      <TwoFactorSection />
      <PasskeysSection />
    </div>
  );
}
