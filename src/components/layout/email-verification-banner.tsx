"use client";

import { useAuthStore } from "@/store/auth.store";
import { useCooldown, useResendVerification } from "@/hooks";
import { AlertTriangle, X, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function EmailVerificationBanner() {
  const user = useAuthStore((s) => s.user);
  const resend = useResendVerification();
  const cooldown = useCooldown(60);

  const [dismissed, setDismissed] = useState(false);

  // Don't show if verified, dismissed, or OAuth user
  if (!user) return null;
  if (user.emailVerifiedAt) return null;
  if (user.emailVerificationSource?.startsWith("oauth_")) return null;
  if (dismissed) return null;

  const handleResend = () => {
    resend.mutate(undefined, {
      onSuccess: () => cooldown.start(),
    });
  };

  return (
    <div
      className={cn(
        "flex items-center justify-between gap-4 px-8 py-3",
        "bg-yellow-500/10 border-b border-yellow-500/20",
      )}
    >
      <div className="flex items-center gap-3">
        <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />
        <p className="text-sm text-foreground">
          Please verify your email address to unlock all features. Check your
          inbox for a verification link.
        </p>
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <Button
          variant="outline"
          size="sm"
          onClick={handleResend}
          disabled={resend.isPending || cooldown.isOnCooldown}
          className="border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-600"
        >
          <Mail className="w-3.5 h-3.5 mr-1.5" />
          {resend.isPending
            ? "Sending..."
            : cooldown.isOnCooldown
              ? `Resend in ${cooldown.remaining}s`
              : "Resend email"}
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 text-muted-foreground hover:text-foreground"
          onClick={() => setDismissed(true)}
        >
          <X className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
