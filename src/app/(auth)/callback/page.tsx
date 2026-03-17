"use client";

import { tokenUtils } from "@/lib/api";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      router.replace(`/login?error=${error}`);
      return;
    }

    if (token) {
      tokenUtils.set(token);
      router.replace("/dashboard");
    } else {
      router.replace("/login?error=no_token");
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        <span className="text-sm text-muted-foreground font-mono">
          Signing you in...
        </span>
      </div>
    </div>
  );
}

export default function CallbackPage() {
  return (
    <Suspense>
      <CallbackHandler />
    </Suspense>
  );
}
