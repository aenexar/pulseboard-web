"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCooldown, useForgotPassword } from "@/hooks";
import { AlertTriangle, ArrowLeft, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const forgotPassword = useForgotPassword();
  const cooldown = useCooldown(60);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    forgotPassword.mutate(email, {
      onSuccess: () => cooldown.start(),
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-sm space-y-8">
        {/* Logo */}
        <Link href="/">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-sm font-mono text-brand">PulseBoard</span>
          </div>
        </Link>

        <div className="space-y-1.5">
          <h1 className="text-2xl font-bold text-foreground">
            Forgot password?
          </h1>
          <p className="text-sm text-muted-foreground">
            Enter your email and we&apos;ll send you a reset link.
          </p>
        </div>

        {/* Success state */}
        {forgotPassword.isSuccess ? (
          <div className="space-y-6">
            <div className="flex items-start gap-3 p-4 rounded-lg bg-brand/10 border border-brand/20">
              <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  Check your email
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  If an account exists for {email}, you&apos;ll receive a reset
                  link shortly.
                </p>
              </div>
            </div>
            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Button>
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {forgotPassword.isError && (
              <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive">
                  Something went wrong. Please try again.
                </p>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoFocus
              />
            </div>

            <Button
              type="submit"
              disabled={
                !email.trim() ||
                forgotPassword.isPending ||
                cooldown.isOnCooldown
              }
              className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold h-10"
            >
              {forgotPassword.isPending
                ? "Sending..."
                : cooldown.isOnCooldown
                  ? `Resend in ${cooldown.remaining}s`
                  : "Send reset link"}
            </Button>

            <Link href="/login">
              <Button variant="outline" className="w-full">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to login
              </Button>
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
