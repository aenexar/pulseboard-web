"use client";

import { Button } from "@/components/ui/button";
import { useCooldown, useProfile, useResendVerification } from "@/hooks";
import { cn } from "@/lib/utils";
import { AlertTriangle, Mail, X } from "lucide-react";
import { useState } from "react";

export function EmailVerificationBanner() {
  const { data: profile } = useProfile();
  const resend = useResendVerification();
  const cooldown = useCooldown(60);
  const [dismissed, setDismissed] = useState(false);

  const handleResend = () => {
    resend.mutate(undefined, {
      onSuccess: () => cooldown.start(),
    });
  };

  if (!profile) return null;
  if (profile.emailVerifiedAt) return null;
  if (profile.emailVerificationSource?.startsWith("oauth_")) return null;
  if (dismissed) return null;

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
          className="border-yellow-500/30 hover:bg-yellow-500/10 text-yellow-600 hover:text-yellow-700"
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
