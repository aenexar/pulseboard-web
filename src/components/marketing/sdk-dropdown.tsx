"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type SDK = {
  name: string;
  href?: string;
  available: boolean;
};

type SDKGroup = {
  label: string;
  sdks: SDK[];
};

const SDK_GROUPS: SDKGroup[] = [
  {
    label: "Hybrid Mobile",
    sdks: [
      {
        name: "React Native CLI",
        href: "https://github.com/aenexar/pulseboard-react-native",
        available: true,
      },
      {
        name: "React Native Expo",
        available: false,
      },
      {
        name: "Flutter",
        available: false,
      },
      {
        name: "Ionic",
        available: false,
      },
      {
        name: "Xamarin",
        available: false,
      },
    ],
  },
  {
    label: "Native Mobile",
    sdks: [
      { name: "Android — View", available: false },
      { name: "Android — Jetpack Compose", available: false },
      { name: "iOS — UIKit", available: false },
      { name: "iOS — SwiftUI", available: false },
    ],
  },
  {
    label: "Web",
    sdks: [
      { name: "React", available: false },
      { name: "Angular", available: false },
      { name: "Vue", available: false },
    ],
  },
  {
    label: "Console",
    sdks: [
      { name: "macOS", available: false },
      { name: "Windows", available: false },
      { name: "Linux", available: false },
    ],
  },
];

export function SDKDropdown() {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      {/* Trigger */}
      <button
        type="button"
        className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors py-4"
      >
        SDKs
        <ChevronDown
          className={cn(
            "w-3.5 h-3.5 transition-transform duration-200",
            open && "rotate-180",
          )}
        />
      </button>

      {/* Invisible bridge — fills gap between trigger and panel */}
      {open && <div className="absolute top-full left-0 w-full h-3" />}

      {/* Dropdown */}
      {open && (
        <div
          className={cn(
            "absolute top-[calc(100%+8px)] left-1/2 -translate-x-1/2 z-50",
            "w-[480px] rounded-xl border border-border",
            "bg-card shadow-2xl p-4",
            "grid grid-cols-2 gap-4",
            "animate-in fade-in slide-in-from-top-2 duration-150",
          )}
        >
          {/* Arrow */}
          <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3 h-3 rotate-45 bg-card border-l border-t border-border" />

          {SDK_GROUPS.map((group) => (
            <div key={group.label} className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2">
                {group.label}
              </p>
              <div className="space-y-0.5">
                {group.sdks.map((sdk) => (
                  <div key={sdk.name}>
                    {sdk.available && sdk.href ? (
                      <Link
                        href={sdk.href}
                        target="_blank"
                        className={cn(
                          "flex items-center justify-between px-2 py-1.5 rounded-md",
                          "text-sm text-foreground",
                          "hover:bg-accent transition-colors",
                        )}
                      >
                        {sdk.name}
                        <Badge
                          variant="outline"
                          className="text-xs text-brand border-brand/30 bg-brand/10 ml-2"
                        >
                          Available
                        </Badge>
                      </Link>
                    ) : (
                      <div
                        className={cn(
                          "flex items-center justify-between px-2 py-1.5 rounded-md",
                          "text-sm text-muted-foreground cursor-not-allowed",
                        )}
                      >
                        {sdk.name}
                        <Badge
                          variant="outline"
                          className="text-xs text-muted-foreground border-border ml-2"
                        >
                          Soon
                        </Badge>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
