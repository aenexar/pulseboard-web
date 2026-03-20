"use client";
import { GeneralTab } from "@/components/settings/org/general-tab";
import { useParams } from "next/navigation";

export default function OrgSettingsGeneralPage() {
  const params = useParams();
  const slug = params?.slug as string;
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">General</h1>
        <p className="text-muted-foreground mt-1">
          Organisation details and branding
        </p>
      </div>
      <GeneralTab slug={slug} />
    </div>
  );
}
