"use client";

import { api } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Organisation } from "@/types";
import { Building2, Check, ChevronsUpDown, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

type Props = {
  orgs: Organisation[];
  currentSlug: string;
};

export function OrgSwitcher({ orgs, currentSlug }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const currentOrg = orgs.find((o) => o.slug === currentSlug);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function switchOrg(slug: string) {
    if (slug === currentSlug) {
      setOpen(false);
      return;
    }

    setOpen(false);

    try {
      await api.patch("/auth/last-org", { slug });
    } catch {
      // Non-critical — proceed anyway
    }

    router.push(`/${slug}`);
  }

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className={cn(
          "w-full flex items-center gap-2 px-2 py-2 rounded-md",
          "text-sm font-medium text-foreground",
          "hover:bg-accent transition-colors",
          open && "bg-accent",
        )}
      >
        <div className="w-6 h-6 rounded bg-brand/20 flex items-center justify-center shrink-0">
          <Building2 className="w-3.5 h-3.5 text-brand" />
        </div>
        <span className="flex-1 text-left truncate">
          {currentOrg?.name ?? "Select org"}
        </span>
        <ChevronsUpDown className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
      </button>

      {open && (
        <div
          className={cn(
            "absolute top-full left-0 right-0 mt-1 z-50",
            "bg-popover border border-border rounded-md shadow-md",
            "py-1 overflow-hidden",
          )}
        >
          {orgs.map((org) => (
            <button
              key={org.id}
              type="button"
              onClick={() => switchOrg(org.slug)}
              className={cn(
                "w-full flex items-center gap-2 px-3 py-2 text-sm",
                "hover:bg-accent transition-colors text-left",
                org.slug === currentSlug
                  ? "text-foreground"
                  : "text-muted-foreground",
              )}
            >
              <div className="w-5 h-5 rounded bg-brand/10 flex items-center justify-center shrink-0">
                <Building2 className="w-3 h-3 text-brand" />
              </div>
              <span className="flex-1 truncate">{org.name}</span>
              {org.slug === currentSlug && (
                <Check className="w-3.5 h-3.5 text-brand shrink-0" />
              )}
            </button>
          ))}

          <div className="border-t border-border mt-1 pt-1">
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                router.push("/organisations/new");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Create organisation
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
