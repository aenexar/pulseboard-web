"use client";

import { Button } from "@/components/ui/button";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";
import { useProfile } from "@/hooks";
import { useAuthStore } from "@/store/auth.store";

export default function VerifyEmailSuccessPage() {
  const { refetch } = useProfile();
  const updateUser = useAuthStore((s) => s.updateUser);

  useEffect(() => {
    refetch().then(({ data }) => {
      if (data) updateUser(data);
    });
  }, [refetch, updateUser]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="w-full max-w-sm space-y-8 text-center">
        <Link href="/">
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="text-sm font-mono text-brand">PulseBoard</span>
          </div>
        </Link>

        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-brand/10 flex items-center justify-center">
            <CheckCircle2 className="w-8 h-8 text-brand" />
          </div>
          <div className="space-y-1">
            <h1 className="text-2xl font-bold text-foreground">
              Email verified!
            </h1>
            <p className="text-sm text-muted-foreground">
              Your email has been verified. You now have full access to
              PulseBoard.
            </p>
          </div>
        </div>

        <Link href="/dashboard">
          <Button className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold">
            Go to Dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
