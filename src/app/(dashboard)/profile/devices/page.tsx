"use client";

import { DevicesTab } from "@/components/settings/profile/devices/devices-tab";

export default function ProfileDevicesPage() {
  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Devices</h1>
        <p className="text-muted-foreground mt-1">
          Session history and active devices — last 90 days
        </p>
      </div>
      <DevicesTab />
    </div>
  );
}
