"use client";

import { FrameworkIcon } from "@/components/framework-icons";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useOrganisations, useProducts, useProjects } from "@/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { Framework } from "@/types";
import {
  Activity,
  BarChart2,
  ChevronDown,
  ChevronRight,
  FolderKanban,
  LayoutDashboard,
  Lightbulb,
  Menu,
  MessageSquare,
  Package,
  ScrollText,
  Settings,
  Tag,
  Terminal,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { OrgSwitcher } from "./org-switcher";

// ─── Persist expanded state ────────────────────────────────────────────────────

function useExpandedSet(storageKey: string) {
  const [expanded, setExpanded] = useState<Set<string>>(() => {
    if (typeof window === "undefined") return new Set();
    try {
      const stored = localStorage.getItem(storageKey);
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
        next.add(id);
      }
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  };

  const expand = (id: string) => {
    setExpanded((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem(storageKey, JSON.stringify([...next]));
      return next;
    });
  };

  return { expanded, toggle, expand };
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
        indent === 3 && "pl-[3.25rem]",
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

// ─── Project nav item ──────────────────────────────────────────────────────────

function ProjectNavItem({
  slug,
  productSlug,
  project,
  expanded,
  onToggle,
  pathname,
  onNavigate,
  indent = 1,
}: {
  slug: string;
  productSlug: string;
  project: { id: string; name: string; framework: string | null };
  expanded: boolean;
  onToggle: () => void;
  pathname: string;
  onNavigate?: () => void;
  indent?: number;
}) {
  const base = `/${slug}/products/${productSlug}/projects/${project.id}`;
  const isActive = pathname.startsWith(base);

  const pl = indent === 1 ? "pl-7" : indent === 2 ? "pl-10" : "pl-[3.25rem]";

  const projectNavItems = [
    { href: base, label: "Overview", icon: LayoutDashboard },
    { href: `${base}/setup`, label: "Setup", icon: Terminal },
    { href: `${base}/analytics`, label: "Analytics", icon: BarChart2 },
    { href: `${base}/releases`, label: "Releases", icon: Tag },
    { href: `${base}/logs`, label: "Logs", icon: ScrollText },
    { href: `${base}/feedback`, label: "Feedback", icon: MessageSquare },
    { href: `${base}/insights`, label: "Insights", icon: Lightbulb },
    { href: `${base}/settings`, label: "Settings", icon: Settings },
  ];

  return (
    <div>
      <button
        onClick={onToggle}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          pl,
          isActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
      >
        {project.framework ? (
          <FrameworkIcon
            framework={project.framework as Framework}
            size={14}
            className="shrink-0"
          />
        ) : (
          <FolderKanban className="w-3.5 h-3.5 shrink-0" />
        )}
        <span className="flex-1 truncate text-left">{project.name}</span>
        {expanded ? (
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        )}
      </button>

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
              indent={indent + 1}
              onClick={onNavigate}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Product nav item ──────────────────────────────────────────────────────────

function ProductNavItem({
  slug,
  product,
  pathname,
  onNavigate,
  expandedProjects,
  onToggleProject,
}: {
  slug: string;
  product: { id: string; name: string; slug: string };
  pathname: string;
  onNavigate?: () => void;
  expandedProjects: Set<string>;
  onToggleProject: (id: string) => void;
}) {
  const productBase = `/${slug}/products/${product.slug}`;
  const isProductActive = pathname.startsWith(productBase);
  const [open, setOpen] = useState(isProductActive);
  const [projectsOpen, setProjectsOpen] = useState(
    pathname.includes(`/${product.slug}/projects`),
  );

  const { data: projects } = useProjects(slug, product.slug);

  // Auto-open product if a child route is active
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (isProductActive && !open) {
      timeout = setTimeout(() => {
        setOpen(true);
      }, 0);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [isProductActive]);

  // Auto-open projects section if a project route is active
  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (pathname.includes(`/products/${product.slug}/projects`)) {
      timeout = setTimeout(() => {
        setProjectsOpen(true);
      }, 0);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [pathname, product.slug]);

  const productNavItems = [
    { href: productBase, label: "Overview", icon: LayoutDashboard },
    { href: `${productBase}/insights`, label: "AI Insights", icon: Lightbulb },
    { href: `${productBase}/settings`, label: "Settings", icon: Settings },
  ];

  const productLabel = product.name === "Default" ? product.slug : product.name;

  return (
    <div>
      {/* Product header */}
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "w-full flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors",
          isProductActive
            ? "text-foreground"
            : "text-muted-foreground hover:text-foreground hover:bg-accent",
        )}
      >
        <Package className="w-3.5 h-3.5 shrink-0" />
        <span className="flex-1 truncate text-left">{productLabel}</span>
        {open ? (
          <ChevronDown className="w-3.5 h-3.5 shrink-0" />
        ) : (
          <ChevronRight className="w-3.5 h-3.5 shrink-0" />
        )}
      </button>

      {open && (
        <div className="mt-0.5 space-y-0.5">
          {/* Overview, AI Insights, Settings */}
          {productNavItems.map((item) => (
            <NavLink
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={
                item.href === productBase
                  ? pathname === productBase
                  : pathname.startsWith(item.href)
              }
              indent={1}
              onClick={onNavigate}
            />
          ))}

          {/* Projects collapsible */}
          <button
            onClick={() => setProjectsOpen((p) => !p)}
            className={cn(
              "w-full flex items-center gap-2.5 pl-7 pr-3 py-1.5 rounded-md text-sm font-medium transition-colors",
              pathname.includes(`/products/${product.slug}/projects`)
                ? "text-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-accent",
            )}
          >
            <FolderKanban className="w-3.5 h-3.5 shrink-0" />
            <span className="flex-1 text-left">Projects</span>
            {(projects?.length ?? 0) > 0 && (
              <span className="text-[10px] text-muted-foreground mr-1">
                {projects?.length}
              </span>
            )}
            {projectsOpen ? (
              <ChevronDown className="w-3.5 h-3.5 shrink-0" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            )}
          </button>

          {projectsOpen && (
            <div className="space-y-0.5">
              {/* All Projects link */}
              <NavLink
                href={`${productBase}/projects`}
                label="All Projects"
                icon={FolderKanban}
                active={pathname === `${productBase}/projects`}
                indent={2}
                onClick={onNavigate}
              />

              {/* Individual projects */}
              {projects?.map((project) => (
                <ProjectNavItem
                  key={project.id}
                  slug={slug}
                  productSlug={product.slug}
                  project={project}
                  expanded={expandedProjects.has(project.id)}
                  onToggle={() => onToggleProject(project.id)}
                  pathname={pathname}
                  onNavigate={onNavigate}
                  indent={2}
                />
              ))}

              {(projects?.length ?? 0) === 0 && (
                <p className="pl-10 py-1.5 text-xs text-muted-foreground">
                  No projects yet
                </p>
              )}
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

  const { expanded, toggle, expand } = useExpandedSet("pb_expanded_projects");

  // Auto-expand the current project
  const currentProjectId = params?.id as string | undefined;
  useEffect(() => {
    if (currentProjectId) expand(currentProjectId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentProjectId]);

  if (!slug) return null;

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Org switcher */}
      <div className="px-4 pt-4 pb-3 shrink-0">
        <OrgSwitcher orgs={orgs ?? []} currentSlug={slug} />
      </div>

      <Separator className="bg-sidebar-border shrink-0" />

      {/* Scrollable nav */}
      <nav className="flex-1 overflow-y-auto min-h-0 px-3 py-3 space-y-0.5">
        {/* Org level */}
        <SectionLabel label="Organization" />
        <NavLink
          href={`/${slug}`}
          label="Overview"
          icon={LayoutDashboard}
          active={pathname === `/${slug}`}
          onClick={onNavigate}
        />
        <NavLink
          href={`/${slug}/members`}
          label="Members"
          icon={Users}
          active={pathname === `/${slug}/members`}
          onClick={onNavigate}
        />
        <NavLink
          href={`/${slug}/activity`}
          label="Activity"
          icon={Activity}
          active={pathname === `/${slug}/activity`}
          onClick={onNavigate}
        />
        <NavLink
          href={`/${slug}/insights`}
          label="AI Insights"
          icon={Lightbulb}
          active={pathname.startsWith(`/${slug}/insights`)}
          onClick={onNavigate}
        />
        <NavLink
          href={`/${slug}/settings`}
          label="Settings"
          icon={Settings}
          active={pathname.startsWith(`${slug}/settings`)}
          onClick={onNavigate}
        />

        {/* Products — always shown, all products listed */}
        {(products?.length ?? 0) > 0 && (
          <>
            <SectionLabel label="Products" />
            <div className="space-y-0.5">
              {products?.map((product) => (
                <ProductNavItem
                  key={product.id}
                  slug={slug}
                  product={product}
                  pathname={pathname}
                  onNavigate={onNavigate}
                  expandedProjects={expanded}
                  onToggleProject={toggle}
                />
              ))}
            </div>
          </>
        )}
      </nav>
    </div>
  );
}

// ─── Desktop sidebar ───────────────────────────────────────────────────────────

function DesktopSidebar() {
  return (
    <aside
      className={cn(
        "hidden lg:flex flex-col w-64 h-screen sticky top-0 shrink-0 overflow-hidden",
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
