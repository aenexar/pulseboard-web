"use client";

import { GeneralTab } from "@/components/settings/profile/general-tab";

export default function ProfileGeneralPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Profile</h1>
        <p className="text-muted-foreground mt-1">
          Manage your personal information and avatar
        </p>
      </div>
      <GeneralTab />
    </div>
  );
}
