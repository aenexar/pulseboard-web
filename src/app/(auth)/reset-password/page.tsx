"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetPassword, useValidateResetToken } from "@/hooks";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const resetPassword = useResetPassword();
  const { isLoading, isError } = useValidateResetToken(token);

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return;
    resetPassword.mutate(
      { token, newPassword },
      { onSuccess: () => setTimeout(() => router.replace("/login"), 2000) },
    );
  };

  const mismatch =
    confirmPassword.length > 0 && newPassword !== confirmPassword;

  if (isLoading) {
    return (
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        <span className="text-sm text-muted-foreground">
          Validating link...
        </span>
      </div>
    );
  }

  if (isError || !token) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Invalid or expired link
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              This password reset link is invalid or has expired. Request a new
              one.
            </p>
          </div>
        </div>
        <Link href="/forgot-password">
          <Button className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold">
            Request new link
          </Button>
        </Link>
      </div>
    );
  }

  if (resetPassword.isSuccess) {
    return (
      <div className="space-y-6">
        <div className="flex items-start gap-3 p-4 rounded-lg bg-brand/10 border border-brand/20">
          <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Password updated
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Redirecting you to login...
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {resetPassword.isError && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">
            {resetPassword.error instanceof Error
              ? resetPassword.error.message
              : "Something went wrong. Please try again."}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="password">New Password</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Min. 8 characters"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            minLength={8}
            required
            className="pr-10"
            autoFocus
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm">Confirm Password</Label>
        <Input
          id="confirm"
          type="password"
          placeholder="Repeat new password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          className={mismatch ? "border-destructive" : ""}
        />
        {mismatch && (
          <p className="text-xs text-destructive">Passwords do not match</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={
          !newPassword ||
          !confirmPassword ||
          mismatch ||
          resetPassword.isPending
        }
        className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold h-10"
      >
        {resetPassword.isPending ? "Updating..." : "Set new password"}
      </Button>

      <Link href="/login">
        <Button variant="outline" className="w-full">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Button>
      </Link>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-sm space-y-8">
        <Link href="/">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-sm font-mono text-brand">PulseBoard</span>
          </div>
        </Link>
        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-foreground">
            Set new password
          </h1>
          <p className="text-sm text-muted-foreground">
            Choose a strong password for your account.
          </p>
        </div>
        <Suspense>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
