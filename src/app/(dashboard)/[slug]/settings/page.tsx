"use client";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  useDeleteOrganisation,
  useOrganisation,
  useUpdateOrganisation,
} from "@/hooks";
import { useCreateCheckout } from "@/hooks/billing/useCreateCheckout";
import { useCreatePortal } from "@/hooks/billing/useCreatePortal";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import {
  AlertTriangle,
  Badge,
  Building2,
  CheckCircle,
  CheckCircle2,
  Save,
  Shield,
  Trash2,
} from "lucide-react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

// ─── General Tab ──────────────────────────────────────────────────────────────

function GeneralTab({ slug }: { slug: string }) {
  const { data: org, isLoading } = useOrganisation(slug);
  const updateOrg = useUpdateOrganisation(slug);

  const [name, setName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!org) return;
    const t = setTimeout(() => {
      setName(org.name);
      setOrgSlug(org.slug);
    }, 0);
    return () => clearTimeout(t);
  }, [org]);

  const handleSave = async () => {
    await updateOrg.mutateAsync({
      name: name.trim(),
      slug: orgSlug.trim(),
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">Organisation Details</CardTitle>
          </div>
          <CardDescription>
            Update your organisation name and URL slug.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Organisation Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Organisation"
            />
          </div>
          <div className="space-y-2">
            <Label>URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">
                pulseboard.app/
              </span>
              <Input
                value={orgSlug}
                onChange={(e) =>
                  setOrgSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                placeholder="my-org"
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Changing the slug will update all URLs — existing links will
              break.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!name.trim() || !orgSlug.trim() || updateOrg.isPending}
          className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateOrg.isPending ? "Saving..." : "Save Changes"}
        </Button>
        {saved && (
          <div className="flex items-center gap-1.5 text-sm text-brand">
            <CheckCircle2 className="w-4 h-4" />
            Saved
          </div>
        )}
        {updateOrg.isError && (
          <div className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4" />
            Failed to save
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Danger Tab ───────────────────────────────────────────────────────────────

function DangerTab({ slug }: { slug: string }) {
  const router = useRouter();
  const deleteOrg = useDeleteOrganisation(slug);

  const handleDelete = async () => {
    await deleteOrg.mutateAsync();
    router.replace("/dashboard");
  };

  return (
    <div className="space-y-6">
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            <CardTitle className="text-base text-destructive">
              Danger Zone
            </CardTitle>
          </div>
          <CardDescription>
            Destructive actions that cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "flex items-center justify-between p-4 rounded-lg",
              "border border-destructive/20 bg-destructive/5",
            )}
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                Delete this organisation
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Permanently deletes the organisation, all projects, events, and
                data. Cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="shrink-0 ml-4 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Organisation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete organisation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the organisation and everything
                    in it — all projects, events, crashes, insights and members.
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90 text-white"
                  >
                    Delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Billing Tab ──────────────────────────────────────────────────────────────

function BillingTab({ slug }: { slug: string }) {
  const { data: org } = useOrganisation(slug);
  const searchParams = useSearchParams();
  const justUpgraded = searchParams.get("success") === "true";

  const checkout = useCreateCheckout(slug);
  const portal = useCreatePortal(slug);

  const plan = org?.plan ?? "free";

  return (
    <div className="space-y-6">
      {/* Success banner */}
      {justUpgraded && (
        <div
          className={cn(
            "flex items-center gap-3 p-4 rounded-lg",
            "bg-brand/10 border border-brand/20",
          )}
        >
          <CheckCircle className="w-5 h-5 text-brand shrink-0" />
          <p className="text-sm text-foreground font-medium">
            You&apos;re now on PulseBoard Pro — welcome to the club!
          </p>
        </div>
      )}

      {/* Current plan */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">Current Plan</CardTitle>
          </div>
          <CardDescription>
            Your organisation&apos;s active subscription.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "flex items-center justify-between p-4 rounded-lg",
              "border border-border bg-muted/30",
            )}
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <p className="text-sm font-semibold text-foreground capitalize">
                  {plan} Plan
                </p>
                <Badge
                  className={cn(
                    "text-xs capitalize",
                    plan === "pro" && "text-brand border-brand/30 bg-brand/10",
                    plan === "enterprise" &&
                      "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
                    plan === "free" && "text-muted-foreground border-border",
                  )}
                >
                  {plan}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {plan === "free" &&
                  "1 project · 1,000 events/month · manual insights only"}
                {plan === "pro" &&
                  "Unlimited projects · 100,000 events/month · scheduled AI insights"}
                {plan === "enterprise" &&
                  "Unlimited everything · custom retention · dedicated support"}
              </p>
            </div>

            {plan === "free" && (
              <Button
                onClick={() => checkout.mutate()}
                disabled={checkout.isPending}
                className="bg-brand hover:bg-brand/90 text-black font-semibold shrink-0 ml-4"
              >
                {checkout.isPending ? "Redirecting..." : "Upgrade to Pro"}
              </Button>
            )}

            {plan === "pro" && (
              <Button
                variant="outline"
                onClick={() => portal.mutate()}
                disabled={portal.isPending}
                className="shrink-0 ml-4"
              >
                {portal.isPending ? "Redirecting..." : "Manage Subscription"}
              </Button>
            )}

            {plan === "enterprise" && (
              <a href="mailto:hello@pulseboard.app">
                <Button variant="outline" className="shrink-0 ml-4">
                  Contact us
                </Button>
              </a>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Feature comparison */}
      {plan === "free" && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              What you&apos;ll unlock with Pro
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {[
              "Unlimited projects",
              "100,000 events per month",
              "30-day data retention",
              "Scheduled AI insights",
              "All AI providers (Anthropic, OpenAI, Google, Moonshot)",
              "Priority support",
            ].map((feature) => (
              <div key={feature} className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-brand shrink-0" />
                <span className="text-sm text-muted-foreground">{feature}</span>
              </div>
            ))}
            <div className="pt-4">
              <Button
                onClick={() => checkout.mutate()}
                disabled={checkout.isPending}
                className="bg-brand hover:bg-brand/90 text-black font-semibold"
              >
                {checkout.isPending ? "Redirecting..." : "Upgrade to Pro"}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function OrgSettingsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data: org } = useOrganisation(slug);
  const user = useAuthStore((s) => s.user);
  const currentMember = org?.members.find((m) => m.userId === user?.id);
  const isOwner = currentMember?.role === "owner";

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Organisation Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your organisation configuration
        </p>
      </div>

      <Tabs defaultValue="general">
        <TabsList className="grid grid-cols-3 w-64">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="danger" disabled={!isOwner}>
            Danger
          </TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="general">
            <GeneralTab slug={slug} />
          </TabsContent>
          <TabsContent value="billing">
            <BillingTab slug={slug} />
          </TabsContent>
          <TabsContent value="danger">
            <DangerTab slug={slug} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
