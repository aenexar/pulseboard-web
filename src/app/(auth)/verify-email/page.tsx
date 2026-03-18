"use client";

import { useVerifyEmail } from "@/hooks";
import axios from "axios";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect } from "react";

function VerifyEmailHandler() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";

  const { isSuccess, isError, error } = useVerifyEmail(token);

  useEffect(() => {
    if (!token) {
      router.replace("/verify-email/error?reason=invalid");
    }
  }, [token, router]);

  useEffect(() => {
    if (isSuccess) {
      router.replace("/verify-email/success");
    }
  }, [isSuccess, router]);

  useEffect(() => {
    if (isError) {
      const reason = axios.isAxiosError(error)
        ? (error.response?.data?.reason ?? "invalid")
        : "invalid";
      router.replace(`/verify-email/error?reason=${reason}`);
    }
  }, [isError, error, router]);

  return (
    <div className="min-h-screen flex items-center justify-center p-8 bg-background">
      <div className="flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
        <span className="text-sm text-muted-foreground font-mono">
          Verifying your email...
        </span>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailHandler />
    </Suspense>
  );
}
