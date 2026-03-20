"use client";

import { ConnectionsTab } from "@/components/settings/profile/connections-tab";

export default function ProfileConnectionsPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Connections</h1>
        <p className="text-muted-foreground mt-1">
          Connected accounts and OAuth providers
        </p>
      </div>
      <ConnectionsTab />
    </div>
  );
}
