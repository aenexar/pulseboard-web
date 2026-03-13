"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/auth.store";
import { useOrganisations } from "@/hooks/organisations/useOrganisations";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const router = useRouter();
  const user = useAuthStore((s) => s.user);
  const { data: orgs, isLoading } = useOrganisations();

  useEffect(() => {
    if (isLoading) return;

    // Redirect to lastVisitedOrgSlug or first org
    const slug = user?.lastVisitedOrgSlug ?? orgs?.[0]?.slug;

    if (slug) {
      router.replace(`/${slug}`);
    }
  }, [isLoading, orgs, user, router]);

  return (
    <div className="space-y-4">
      <Skeleton className="h-8 w-48" />
      <div className="grid grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    </div>
  );
}
