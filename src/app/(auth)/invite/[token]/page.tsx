"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAcceptInvitation, useInvitationByToken } from "@/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { AlertTriangle, Building2, CheckCircle2, LogIn } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";

export default function InvitePage() {
  const params = useParams();
  const token = params?.token as string;
  const router = useRouter();
  const user = useAuthStore((s) => s.user);

  const { data: invitation, isLoading, error } = useInvitationByToken(token);
  const acceptInvitation = useAcceptInvitation();

  const handleAccept = async () => {
    const org = await acceptInvitation.mutateAsync(token);
    router.replace(`/${org.slug}`);
  };

  // ─── Not logged in ────────────────────────────────────────────────────

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-brand" />
              </div>
            </div>
            <CardTitle>You have been invited</CardTitle>
            <CardDescription>
              Sign in or create an account to accept this invitation.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Link href={`/login?from=/invite/${token}`}>
              <Button className="w-full bg-brand hover:bg-brand/90 text-black font-semibold">
                <LogIn className="w-4 h-4 mr-2" />
                Sign in to accept
              </Button>
            </Link>
            <Link href={`/register?from=/invite/${token}`}>
              <Button variant="outline" className="w-full">
                Create an account
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Loading ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 space-y-4">
            <Skeleton className="h-12 w-12 rounded-full mx-auto" />
            <Skeleton className="h-6 w-48 mx-auto" />
            <Skeleton className="h-4 w-64 mx-auto" />
            <Skeleton className="h-10 w-full" />
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Invalid / expired ────────────────────────────────────────────────

  if (error || !invitation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
            </div>
            <CardTitle>Invitation not found</CardTitle>
            <CardDescription>
              This invitation link is invalid or has expired.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/dashboard">
              <Button variant="outline" className="w-full">
                Go to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Already accepted ────────────────────────────────────────────────

  if (acceptInvitation.isSuccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-brand" />
              </div>
            </div>
            <CardTitle>You&apos;re in!</CardTitle>
            <CardDescription>
              You have successfully joined {invitation.organisation?.name}.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href={`/${invitation.organisation?.slug}`}>
              <Button className="w-full bg-brand hover:bg-brand/90 text-black font-semibold">
                Go to Organisation
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ─── Accept ───────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
              <Building2 className="w-6 h-6 text-brand" />
            </div>
          </div>
          <CardTitle>You&apos;ve been invited</CardTitle>
          <CardDescription>
            You have been invited to join{" "}
            <span className="font-semibold text-foreground">
              {invitation.organisation?.name}
            </span>{" "}
            as a{" "}
            <span className="font-semibold text-foreground capitalize">
              {invitation.role}
            </span>
            .
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {acceptInvitation.isError && (
            <div
              className={cn(
                "flex items-center gap-3 p-3 rounded-lg",
                "bg-destructive/10 border border-destructive/20",
              )}
            >
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">
                Failed to accept invitation. It may have already been used or
                expired.
              </p>
            </div>
          )}
          <Button
            onClick={handleAccept}
            disabled={acceptInvitation.isPending}
            className="w-full bg-brand hover:bg-brand/90 text-black font-semibold"
          >
            {acceptInvitation.isPending ? "Accepting..." : "Accept Invitation"}
          </Button>
          <Link href="/dashboard">
            <Button variant="outline" className="w-full">
              Decline
            </Button>
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
