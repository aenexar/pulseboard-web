import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useOrganisation } from "@/hooks";
import { useCreateCheckout } from "@/hooks/billing/useCreateCheckout";
import { useCreatePortal } from "@/hooks/billing/useCreatePortal";
import { cn } from "@/lib/utils";
import { Building2, CheckCircle } from "lucide-react";
import { useSearchParams } from "next/navigation";

export function BillingTab({ slug }: { slug: string }) {
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
                  "1 project · 10,000 events/month · manual insights only"}
                {plan === "pro" &&
                  "Unlimited projects · unlimited events · scheduled AI insights"}
                {plan === "studio_starter" &&
                  "1 product · 5 projects · unlimited events · 15 members"}
                {plan === "studio_growth" &&
                  "1 product · 15 projects · unlimited events · 15 members"}
                {plan === "studio_scale" &&
                  "1 product · 30 projects · unlimited events · 15 members"}
                {plan === "studio_unlimited" &&
                  "1 product · unlimited projects · unlimited events · 15 members"}
                {plan === "enterprise" &&
                  "Unlimited products & projects · custom retention · dedicated support"}
              </p>
            </div>

            {plan === "free" && (
              <Button
                // onClick={() => checkout.mutate()}
                disabled={checkout.isPending}
                className="bg-brand hover:bg-brand/90 text-black font-semibold shrink-0 ml-4"
              >
                {checkout.isPending ? "Redirecting..." : "Upgrade to Pro"}
              </Button>
            )}

            {(plan === "pro" || plan.startsWith("studio")) && (
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
