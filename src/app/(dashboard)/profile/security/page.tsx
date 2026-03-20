"use client";

import { SecurityTab } from "@/components/settings/profile/security/security-tab";

export default function ProfileSecurityPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Security</h1>
        <p className="text-muted-foreground mt-1">
          Password, two-factor authentication and passkeys
        </p>
      </div>
      <SecurityTab />
    </div>
  );
}
