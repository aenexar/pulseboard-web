"use client";

import { AIContextTab } from "@/components/settings/org/ai-context-tab";
import { BillingTab } from "@/components/settings/org/billing-tab";
import { DangerTab } from "@/components/settings/org/danger-tab";
import { GeneralTab } from "@/components/settings/org/general-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const TABS = ["general", "ai", "billing", "danger"] as const;
type Tab = (typeof TABS)[number];

export default function OrgSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const slug = params?.slug as string;

  const tab = (searchParams.get("tab") ?? "general") as Tab;
  const validTab = TABS.includes(tab) ? tab : "general";

  const setTab = (value: string) => {
    router.replace(`/${slug}/settings?tab=${value}`);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">
          Organisation Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your organisation details, AI configuration, billing, and
          advanced options
        </p>
      </div>

      <Tabs value={validTab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Config</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
          <TabsTrigger value="danger">Danger</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <GeneralTab slug={slug} />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AIContextTab slug={slug} />
        </TabsContent>

        <TabsContent value="billing" className="mt-6">
          <BillingTab slug={slug} />
        </TabsContent>

        <TabsContent value="danger" className="mt-6">
          <DangerTab slug={slug} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
