"use client";

import { Separator } from "@/components/ui/separator";
import { useOrganisations } from "@/hooks/organisations/useOrganisations";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import {
  Activity,
  BarChart2,
  ChevronLeft,
  FolderKanban,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { OrgSwitcher } from "./org-switcher";

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

function globalNav(slug: string): NavItem[] {
  return [
    { href: `/${slug}`, label: "Overview", icon: LayoutDashboard },
    { href: `/${slug}/projects`, label: "Projects", icon: FolderKanban },
    { href: `/${slug}/activity`, label: "Activity", icon: Activity },
    { href: `/${slug}/members`, label: "Members", icon: Users },
    { href: `/${slug}/settings`, label: "Settings", icon: Settings },
  ];
}

function projectNav(slug: string, projectId: string): NavItem[] {
  return [
    {
      href: `/${slug}/projects/${projectId}`,
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: `/${slug}/projects/${projectId}/analytics`,
      label: "Analytics",
      icon: BarChart2,
    },
    {
      href: `/${slug}/projects/${projectId}/insights`,
      label: "Insights",
      icon: Lightbulb,
    },
    {
      href: `/${slug}/projects/${projectId}/settings`,
      label: "Settings",
      icon: Settings,
    },
  ];
}

function NavLink({
  href,
  label,
  icon: Icon,
  active,
}: NavItem & { active: boolean }) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-brand/10 text-brand"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
      )}
    >
      <Icon className="w-4 h-4 shrink-0" />
      {label}
    </Link>
  );
}

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const user = useAuthStore((s) => s.user);

  const { data: orgs } = useOrganisations();

  const slug = params?.slug as string | undefined;
  const projectId = params?.id as string | undefined;

  const isProjectView = !!projectId;
  const currentSlug = slug ?? user?.lastVisitedOrgSlug ?? "";

  const navItems = isProjectView
    ? projectNav(currentSlug, projectId!)
    : globalNav(currentSlug);

  return (
    <aside
      className={cn(
        "flex flex-col w-64 min-h-screen",
        "bg-sidebar border-r border-sidebar-border",
        "px-4 py-6",
      )}
    >
      {/* Org Switcher */}
      <div className="mb-6">
        <OrgSwitcher orgs={orgs ?? []} currentSlug={currentSlug} />
      </div>

      {/* Back to projects — project view only */}
      {isProjectView && (
        <Link
          href={`/${currentSlug}/projects`}
          className="flex items-center gap-2 px-3 py-2 mb-2 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          All Projects
        </Link>
      )}

      {/* Nav */}
      <nav className="flex flex-col gap-1 flex-1">
        {navItems.map((item) => (
          <NavLink key={item.href} {...item} active={pathname === item.href} />
        ))}
      </nav>

      {/* Bottom branding */}
      <Separator className="bg-sidebar-border mb-4" />
      <div className="px-2">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">
            PulseBoard
          </span>
        </div>
      </div>
    </aside>
  );
}
