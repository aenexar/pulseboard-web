"use client";

import { BillingTab } from "@/components/settings/org/billing-tab";
import { useParams } from "next/navigation";

export default function OrgSettingsBillingPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Billing</h1>
        <p className="text-muted-foreground mt-1">
          Manage your subscription and plan
        </p>
      </div>
      <BillingTab slug={slug} />
    </div>
  );
}
