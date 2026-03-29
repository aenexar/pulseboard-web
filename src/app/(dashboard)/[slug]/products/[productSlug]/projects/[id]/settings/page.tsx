"use client";

import { AIConfigTab } from "@/components/settings/projects/ai-tab";
import { ProjectGeneralTab } from "@/components/settings/projects/general-tab";
import { RepositoryTab } from "@/components/settings/projects/repository-tab";
import { SecurityTab } from "@/components/settings/projects/security-tab";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useParams, useRouter, useSearchParams } from "next/navigation";

const TABS = ["general", "ai", "repository", "security"] as const;
type Tab = (typeof TABS)[number];

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;
  const projectId = params?.id as string;

  const tab = (searchParams.get("tab") ?? "general") as Tab;
  const validTab = TABS.includes(tab) ? tab : "general";

  const setTab = (value: string) => {
    router.replace(
      `/${slug}/products/${productSlug}/projects/${projectId}/settings?tab=${value}`,
    );
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Project Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your project configuration, AI provider, and advanced options
        </p>
      </div>

      <Tabs value={validTab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="ai">AI Config</TabsTrigger>
          <TabsTrigger value="repository">Repository</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="mt-6">
          <ProjectGeneralTab
            slug={slug}
            productSlug={productSlug}
            projectId={projectId}
          />
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <AIConfigTab
            slug={slug}
            productSlug={productSlug}
            projectId={projectId}
          />
        </TabsContent>

        <TabsContent value="repository" className="mt-6">
          <RepositoryTab
            slug={slug}
            productSlug={productSlug}
            projectId={projectId}
          />
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <SecurityTab
            slug={slug}
            productSlug={productSlug}
            projectId={projectId}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
