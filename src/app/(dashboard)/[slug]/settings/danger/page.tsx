"use client";

import { DangerTab } from "@/components/settings/org/danger-tab";
import { useParams } from "next/navigation";

export default function OrgSettingsDangerPage() {
  const params = useParams();
  const slug = params?.slug as string;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Danger Zone</h1>
        <p className="text-muted-foreground mt-1">
          Destructive actions that cannot be undone
        </p>
      </div>
      <DangerTab slug={slug} />
    </div>
  );
}
