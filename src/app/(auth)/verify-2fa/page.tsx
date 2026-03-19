"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useVerify2FA } from "@/hooks";
import axios from "axios";
import { AlertTriangle, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function Verify2FAForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const verify2FA = useVerify2FA();
  const [code, setCode] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    verify2FA.mutate(
      { challengeToken: token, code },
      { onSuccess: () => router.replace("/dashboard") },
    );
  };

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          Invalid session. Please log in again.
        </p>
        <Link href="/login">
          <Button variant="outline" className="w-full">
            Back to login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {verify2FA.isError && (
        <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
          <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
          <p className="text-sm text-destructive">
            {axios.isAxiosError(verify2FA.error)
              ? (verify2FA.error.response?.data?.message ??
                "Invalid code. Please try again.")
              : "Invalid code. Please try again."}
          </p>
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="code">Authentication Code</Label>
        <Input
          id="code"
          placeholder="000000"
          value={code}
          onChange={(e) =>
            setCode(e.target.value.replace(/\D/g, "").slice(0, 6))
          }
          className="font-mono text-center text-2xl tracking-widest h-14"
          maxLength={6}
          autoFocus
          autoComplete="one-time-code"
        />
        <p className="text-xs text-muted-foreground text-center">
          Enter the 6-digit code from your authenticator app, or use a recovery
          code.
        </p>
      </div>

      <Button
        type="submit"
        disabled={code.length < 6 || verify2FA.isPending}
        className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold h-10"
      >
        {verify2FA.isPending ? "Verifying..." : "Verify"}
      </Button>

      <Link href="/login">
        <Button variant="outline" className="w-full">
          Back to login
        </Button>
      </Link>
    </form>
  );
}

export default function Verify2FAPage() {
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
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-brand" />
            <h1 className="text-2xl font-bold text-foreground">
              Two-factor authentication
            </h1>
          </div>
          <p className="text-sm text-muted-foreground">
            Open your authenticator app and enter the code for PulseBoard.
          </p>
        </div>

        <Suspense>
          <Verify2FAForm />
        </Suspense>
      </div>
    </div>
  );
}
