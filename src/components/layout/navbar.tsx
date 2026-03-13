"use client";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { useLogout } from "@/hooks";
import { useAuthStore } from "@/store/auth.store";
import { LogOut, Settings, User } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

// ─── Page metadata ────────────────────────────────────────────────────────────

function usePageMeta() {
  const pathname = usePathname();
  const params = useParams();
  const slug = params?.slug as string | undefined;
  const id = params?.id as string | undefined;

  if (!slug) return { title: "Dashboard", description: null };

  // Project-level pages
  if (id) {
    if (pathname.endsWith("/analytics"))
      return {
        title: "Analytics",
        description: "Crash rate, performance and device breakdown",
      };
    if (pathname.endsWith("/insights"))
      return {
        title: "Insights",
        description: "AI-powered analysis of your app's health",
      };
    if (pathname.endsWith("/settings"))
      return {
        title: "Settings",
        description: "Manage your project configuration",
      };
    return {
      title: "Project",
      description: "Live event feed and project details",
    };
  }

  // Org-level pages
  if (pathname.endsWith("/projects"))
    return {
      title: "Projects",
      description: "All projects in this organisation",
    };
  if (pathname.endsWith("/members"))
    return {
      title: "Members",
      description: "Manage organisation members and invitations",
    };
  if (pathname.endsWith("/settings"))
    return {
      title: "Settings",
      description: "Manage your organisation configuration",
    };
  if (pathname.endsWith("/activity"))
    return {
      title: "Activity",
      description: "Recent activity across this organisation",
    };

  return { title: "Overview", description: "Organisation summary" };
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

export function Navbar() {
  const logout = useLogout();
  const user = useAuthStore((s) => s.user);
  const params = useParams();
  const slug = params?.slug as string | undefined;

  const { title, description } = usePageMeta();

  return (
    <header className="h-16 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
      <div className="flex items-center justify-between h-full px-8">
        {/* Page title + description */}
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-sm font-semibold text-foreground leading-none">
              {title}
            </h2>
            {description && (
              <p className="text-xs text-muted-foreground mt-0.5">
                {description}
              </p>
            )}
          </div>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="flex items-center gap-2 px-2 h-9 hover:bg-accent"
              >
                <Avatar className="w-7 h-7">
                  <AvatarFallback className="bg-brand/10 text-brand text-xs font-semibold">
                    {user?.name?.slice(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="text-sm font-medium text-foreground hidden sm:block max-w-32 truncate">
                  {user?.name}
                </span>
              </Button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel className="font-normal">
                <div className="flex flex-col gap-0.5">
                  <p className="text-sm font-medium text-foreground truncate">
                    {user?.name}
                  </p>
                  <p className="text-xs text-muted-foreground truncate">
                    {user?.email}
                  </p>
                </div>
              </DropdownMenuLabel>

              <DropdownMenuSeparator />

              {slug && (
                <DropdownMenuItem asChild>
                  <Link href={`/${slug}/settings`} className="cursor-pointer">
                    <Settings className="w-4 h-4 mr-2" />
                    Organisation Settings
                  </Link>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem asChild>
                <Link href="/profile" className="cursor-pointer">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </Link>
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <DropdownMenuItem
                onClick={() => logout.mutate()}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
