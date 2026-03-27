"use client";

import { FrameworkIcon } from "@/components/framework-icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useOrganisations, useProducts, useProjects } from "@/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { Framework } from "@/types";
import {
  Activity,
  AlertTriangle,
  BarChart2,
  Brain,
  ChevronDown,
  ChevronRight,
  CreditCard,
  FolderKanban,
  GitBranch,
  LayoutDashboard,
  Lightbulb,
  Menu,
  MessageSquare,
  Monitor,
  ScrollText,
  Settings,
  Shield,
  Tag,
  Terminal,
  User,
  Users,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { OrgSwitcher } from "./org-switcher";

// ─── Persist expanded state ────────────────────────────────────────────────────

function useExpandedProjects() {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem("pb_expanded_projects");
      return stored ? new Set(JSON.parse(stored)) : new Set();
    } catch {
      return new Set();
    }
  });

  const toggle = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        // Collapse all others — only one project open at a time
        next.clear();
        next.add(id);
      }
      localStorage.setItem("pb_expanded_projects", JSON.stringify([...next]));
      return next;
    });
  };

  return { expanded, toggle };
}

// ─── Nav link ──────────────────────────────────────────────────────────────────

function NavLink({
  href,
  label,
  icon: Icon,
  active,
  indent = 0,
  onClick,
}: {
  href: string;
  label: string;
  icon: React.ElementType;
  active: boolean;
  indent?: number;
  onClick?: () => void;
}) {
  return (
    <Link
      href={href}
      onClick={onClick}
      className={cn(
        "flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
        active
          ? "bg-brand/10 text-brand"
          : "text-muted-foreground hover:text-foreground hover:bg-accent",
        indent === 1 && "pl-7",
        indent === 2 && "pl-10",
      )}
    >
      <Icon className="w-3.5 h-3.5 shrink-0" />
      <span className="truncate">{label}</span>
    </Link>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────────

function SectionLabel({ label }: { label: string }) {
  return (
    <p className="px-3 pt-3 pb-1 text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/60">
      {label}
    </p>
  );
}

// ─── Project nav ───────────────────────────────────────────────────────────────

function ProjectNavItem({
  slug,
  productSlug,
  project,
  expanded,
  onToggle,
  pathname,
  onNavigate,
}: {
  slug: string;
  productSlug: string;
  project: { id: string; name: string; framework: string | null };
  expanded: boolean;
  onToggle: () => void;
  pathname: string;
  onNavigate?: () => void;
}) {
  const base = `/${slug}/products/${productSlug}/projects/${project.id}`;
  const isActive = pathname.startsWith(base);
  const settingsBase = `${base}/settings`;
  const isSettingsOpen = pathname.startsWith(settingsBase);
  const [settingsOpen, setSettingsOpen] = useState(isSettingsOpen);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!expanded) {
      timeout = setTimeout(() => {
        setSettingsOpen(false);
      }, 0);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [expanded]);

  const projectNavItems = [
    { href: base, label: "Overview", icon: LayoutDashboard },
    { href: `${base}/setup`, label: "Setup", icon: Terminal }, // ← add
    { href: `${base}/analytics`, label: "Analytics", icon: BarChart2 },
    { href: `${base}/releases`, label: "Releases", icon: Tag },
    { href: `${base}/logs`, label: "Logs", icon: ScrollText },
    { href: `${base}/feedback`, label: "Feedback", icon: MessageSquare },
    { href: `${base}/insights`, label: "Insights", icon: Lightbulb },
  ];

  const settingsItems = [
    { href: `${settingsBase}/details`, label: "Details", icon: Settings },
    { href: `${settingsBase}/ai`, label: "AI Config", icon: Brain },
    {
      href: `${settingsBase}/repository`,
      label: "Repository",
      icon: GitBranch,
    },
    { href: `${settingsBase}/security`, label: "Security", icon: Shield },
  ];

  return (
    <div>
      {/* Project header — clickable to expand */}
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
      >
        {project.framework && (
          <FrameworkIcon
            framework={project.framework as Framework}
            size={14}
            className="shrink-0"
          />
        )}
        <span className="flex-1 truncate text-left">{project.name}</span>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        )}
      </button>

      {/* Project sub-nav */}
      {expanded && (
        <div className="mt-0.5 space-y-0.5">
          {projectNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={
                item.href === base
                  ? pathname === base
                  : pathname.startsWith(item.href)
              }
              indent={1}
              onClick={onNavigate}
            />
          ))}

          {/* Settings collapsible */}
          <button
            onClick={() => setSettingsOpen((s) => !s)}
            className={cn(
              "w-full flex items-center gap-2.5 pl-7 pr-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              isSettingsOpen
                ? "bg-brand/10 text-brand"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <Settings className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-left">Settings</span>
            {settingsOpen ? (
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            )}
          </button>

          {settingsOpen && (
            <div className="space-y-0.5">
              {settingsItems.map((item) => (
                <NavLink
                  key={item.href}
                  href={item.href}
                  label={item.label}
                  icon={item.icon}
                  active={pathname.startsWith(item.href)}
                  indent={2}
                  onClick={onNavigate}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Sidebar content ───────────────────────────────────────────────────────────

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const params = useParams();
  const user = useAuthStore((s) => s.user);

  const { data: orgs } = useOrganisations();
  const slug =
    (params?.slug as string | undefined) ??
    user?.lastVisitedOrgSlug ??
    orgs?.[0]?.slug ??
    "";

  const { data: products } = useProducts(slug);
  const productSlug = products?.[0]?.slug ?? "";
  const isMultiProduct = (products?.length ?? 0) > 1;

  const { data: projects } = useProjects(slug, productSlug);
  const { expanded, toggle } = useExpandedProjects();

  const currentProjectId = params?.id as string | undefined;
  useEffect(() => {
    if (currentProjectId && !expanded.has(currentProjectId)) {
      toggle(currentProjectId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId]);

  const orgSettingsItems = [
    { href: `/${slug}/settings/general`, label: "General", icon: Settings },
    { href: `/${slug}/settings/billing`, label: "Billing", icon: CreditCard },
    { href: `/${slug}/settings/danger`, label: "Danger", icon: AlertTriangle },
  ];

  const profileItems = [
    { href: "/profile/general", label: "General", icon: User },
    { href: "/profile/security", label: "Security", icon: Shield },
    { href: "/profile/connections", label: "Connections", icon: Zap },
    { href: "/profile/devices", label: "Devices", icon: Monitor },
    { href: "/profile/activity", label: "Activity", icon: Activity },
  ];

  if (!slug) return null;

  return (
    <div className="flex flex-col h-full">
      {/* Org switcher */}
      <div className="px-4 pt-4 pb-3">
        <OrgSwitcher orgs={orgs ?? []} currentSlug={slug} />
      </div>

      <Separator className="bg-sidebar-border" />

      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
        {/* Overview */}
        <NavLink
          href={`/${slug}`}
          label="Overview"
          icon={LayoutDashboard}
          active={pathname === `/${slug}`}
          onClick={onNavigate}
        />

        {/* Members */}
        <NavLink
          href={`/${slug}/members`}
          label="Members"
          icon={Users}
          active={pathname === `/${slug}/members`}
          onClick={onNavigate}
        />

        {/* Activity */}
        <NavLink
          href={`/${slug}/activity`}
          label="Activity"
          icon={Activity}
          active={pathname === `/${slug}/activity`}
          onClick={onNavigate}
        />

        {/* Org Settings — always visible, no collapse */}
        <SectionLabel label="Settings" />
        {orgSettingsItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname.startsWith(item.href)}
            indent={1}
            onClick={onNavigate}
          />
        ))}

        {/* Projects */}
        {!isMultiProduct ? (
          <>
            <SectionLabel label="Projects" />
            <div className="space-y-0.5">
              {projects?.map((project) => (
                <ProjectNavItem
                  key={project.id}
                  slug={slug}
                  productSlug={productSlug}
                  project={project}
                  expanded={expanded.has(project.id)}
                  onToggle={() => toggle(project.id)}
                  pathname={pathname}
                  onNavigate={onNavigate}
                />
              ))}
              {(projects?.length ?? 0) === 0 && (
                <Link
                  href={`/${slug}/products/${productSlug}/projects`}
                  onClick={onNavigate}
                  className="flex items-center gap-2.5 px-3 py-1.5 rounded-md text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                >
                  <FolderKanban className="w-3.5 h-3.5 shrink-0" />
                  <span>All Projects</span>
                </Link>
              )}
            </div>
          </>
        ) : (
          <>
            <SectionLabel label="Products" />
            {products?.map((product) => (
              <div key={product.id}>
                <p className="px-3 py-1 text-xs font-semibold text-muted-foreground truncate">
                  {product.name}
                </p>
              </div>
            ))}
          </>
        )}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* Profile — always expanded, static list */}
      <div className="p-3 space-y-0.5">
        <div className="flex items-center gap-2.5 px-3 py-1.5">
          <Avatar className="w-5 h-5 shrink-0">
            <AvatarImage
              src={user?.avatarUrl ?? undefined}
              alt={user?.name ?? ""}
            />
            <AvatarFallback className="text-[9px] bg-brand/10 text-brand">
              {user?.name?.slice(0, 2).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <span className="text-sm font-medium text-foreground truncate">
            {user?.name}
          </span>
        </div>

        {profileItems.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            active={pathname.startsWith(item.href)}
            onClick={onNavigate}
          />
        ))}

        {/* Branding */}
        <div className="flex items-center gap-2 px-3 pt-2">
          <div className="w-1.5 h-1.5 rounded-full bg-brand animate-pulse" />
          <span className="text-xs font-mono text-muted-foreground">
            PulseBoard
          </span>
        </div>
      </div>
    </div>
  );
}
// ─── Desktop sidebar ───────────────────────────────────────────────────────────

function DesktopSidebar() {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 min-h-screen shrink-0",
        "bg-sidebar border-r border-sidebar-border",
      )}
    >
      <SidebarContent />
    </aside>
  );
}

// ─── Mobile sidebar ────────────────────────────────────────────────────────────

function MobileSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="lg:hidden">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="fixed top-4 left-4 z-50 lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-64 p-0 bg-sidebar border-sidebar-border"
        >
          <SidebarContent onNavigate={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
}

// ─── Export ────────────────────────────────────────────────────────────────────

export function Sidebar() {
  return (
    <>
      <DesktopSidebar />
      <MobileSidebar />
    </>
  );
}
