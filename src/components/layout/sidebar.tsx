"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useLogout } from "@/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import {
  Activity,
  BarChart2,
  ChevronLeft,
  FolderKanban,
  LayoutDashboard,
  LogOut,
  Lightbulb,
  Settings,
} from "lucide-react";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";

// ─── Nav item type ────────────────────────────────────────────────────────────

type NavItem = {
  href: string;
  label: string;
  icon: React.ElementType;
};

// ─── Global nav ───────────────────────────────────────────────────────────────

const globalNav: NavItem[] = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/activity", label: "Activity", icon: Activity },
];

// ─── Project nav ──────────────────────────────────────────────────────────────

function projectNav(projectId: string): NavItem[] {
  return [
    {
      href: `/projects/${projectId}`,
      label: "Overview",
      icon: LayoutDashboard,
    },
    {
      href: `/projects/${projectId}/analytics`,
      label: "Analytics",
      icon: BarChart2,
    },
    {
      href: `/projects/${projectId}/insights`,
      label: "Insights",
      icon: Lightbulb,
    },
    {
      href: `/projects/${projectId}/settings`,
      label: "Settings",
      icon: Settings,
    },
  ];
}

// ─── Nav link ─────────────────────────────────────────────────────────────────

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

// ─── Sidebar ──────────────────────────────────────────────────────────────────

export function Sidebar() {
  const pathname = usePathname();
  const params = useParams();
  const logout = useLogout();
  const user = useAuthStore((s) => s.user);

  const projectId = params?.projectId as string | undefined;
  const isProjectView = !!projectId;

  const navItems = isProjectView ? projectNav(projectId!) : globalNav;

  return (
    <aside
      className={cn(
        "flex flex-col w-64 min-h-screen",
        "bg-sidebar border-r border-sidebar-border",
        "px-4 py-6",
      )}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 px-2 mb-8">
        <div className="w-2 h-2 rounded-full bg-brand animate-pulse shrink-0" />
        <span className="text-lg font-mono font-bold text-foreground">
          PulseBoard
        </span>
      </div>

      {/* Back to projects — project view only */}
      {isProjectView && (
        <Link
          href="/projects"
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

      <Separator className="bg-sidebar-border my-4" />

      {/* Theme toggle */}
      <div className="flex items-center justify-between px-2 mb-4">
        <span className="text-xs text-muted-foreground font-medium">
          Appearance
        </span>
        <ThemeToggle />
      </div>

      <Separator className="bg-sidebar-border mb-4" />

      {/* User */}
      <div className="flex items-center gap-3 px-2">
        <Avatar className="w-8 h-8 shrink-0">
          <AvatarFallback className="bg-accent text-accent-foreground text-xs">
            {user?.name?.slice(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground truncate">
            {user?.name}
          </p>
          <p className="text-xs text-muted-foreground truncate">
            {user?.email}
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-foreground shrink-0"
          onClick={() => logout.mutate()}
        >
          <LogOut className="w-4 h-4" />
        </Button>
      </div>
    </aside>
  );
}
