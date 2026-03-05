"use client";

import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SDKDropdown } from "@/components/marketing/sdk-dropdown";
import { useAuthStore } from "@/store/auth.store";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="min-h-screen bg-background">
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-14 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
            <span className="font-mono font-bold text-foreground tracking-tight">
              PulseBoard
            </span>
          </Link>

          {/* Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="#features"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Features
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              How it works
            </Link>
            <SDKDropdown />
            <Link
              href="/pricing"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <ThemeToggle />
            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button
                  size="sm"
                  className="text-sm bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
                >
                  Go to Dashboard
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="text-sm">
                    Sign in
                  </Button>
                </Link>
                <Link href="/register">
                  <Button
                    size="sm"
                    className="text-sm bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
                  >
                    Get started
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {children}
    </div>
  );
}
