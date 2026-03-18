"use client";

import { Button } from "@/components/ui/button";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Suspense } from "react";
import { useResendVerification } from "@/hooks";

const REASON_MESSAGES: Record<string, string> = {
  invalid: "This verification link is invalid.",
  used: "This verification link has already been used.",
  expired: "This verification link has expired.",
};

function ErrorContent() {
  const searchParams = useSearchParams();
  const reason = searchParams.get("reason") ?? "invalid";
  const message = REASON_MESSAGES[reason] ?? REASON_MESSAGES.invalid;
  const isExpired = reason === "expired";
  const resend = useResendVerification();

  return (
    <div className="w-full max-w-sm space-y-8 text-center">
      <Link href="/">
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="text-sm font-mono text-brand">PulseBoard</span>
        </div>
      </Link>

      <div className="flex flex-col items-center gap-4">
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-destructive" />
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-bold text-foreground">
            Verification failed
          </h1>
          <p className="text-sm text-muted-foreground">{message}</p>
        </div>
      </div>

      <div className="space-y-3">
        {isExpired && (
          <Button
            className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
            onClick={() => resend.mutate()}
            disabled={resend.isPending || resend.isSuccess}
          >
            {resend.isPending
              ? "Sending..."
              : resend.isSuccess
                ? "Email sent!"
                : "Resend verification email"}
          </Button>
        )}
        <Link href="/dashboard">
          <Button variant="outline" className="w-full">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailErrorPage() {
  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <Suspense>
        <ErrorContent />
      </Suspense>
    </div>
  );
}
