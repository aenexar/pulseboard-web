import { ThemeToggle } from "@/components/layout/theme-toggle";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative min-h-screen bg-background">
      {/* Background grid — matches homepage */}
      <div
        className={`
        absolute inset-0 pointer-events-none
        [background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)]
        [background-size:48px_48px]
        opacity-40
      `}
      />

      {/* Top bar */}
      <div className="relative z-10 flex items-center justify-between px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to home
        </Link>
        <ThemeToggle />
      </div>

      {/* Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
}
