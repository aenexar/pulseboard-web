"use client";

import { api, tokenUtils } from "@/lib/api";
import { useAuthStore } from "@/store/auth.store";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function CallbackHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const setAuth = useAuthStore((s) => s.setAuth);

  useEffect(() => {
    const token = searchParams.get("token");
    const error = searchParams.get("error");

    if (error) {
      router.replace(`/login?error=${error}`);
      return;
    }

    if (!token) {
      router.replace("/login?error=no_token");
      return;
    }

    // Store token first so API calls are authenticated
    tokenUtils.set(token);

    // Fetch user profile to populate auth store
    api.get("/profile").then(async (res) => {
      const user = res.data.data;
      setAuth(user, token);

      // Ensure lastVisitedOrgSlug is synced
      if (user.lastVisitedOrgSlug) {
        await api.patch("/auth/last-org", { slug: user.lastVisitedOrgSlug });
      }

      if (!user.onboardingCompletedAt && !user.onboardingDismissedAt) {
        router.replace("/onboarding");
      } else {
        router.replace("/dashboard");
      }
    });
  }, [searchParams, router, setAuth]);

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
