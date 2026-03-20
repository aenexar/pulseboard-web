"use client";

import { ActivityTab } from "@/components/settings/profile/activity-tab";

export default function ProfileActivityPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Activity</h1>
        <p className="text-muted-foreground mt-1">
          A log of all actions taken on your account
        </p>
      </div>
      <ActivityTab />
    </div>
  );
}
