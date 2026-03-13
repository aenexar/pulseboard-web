import { cn } from "@/lib/utils";
import { Sparkles, Zap } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { Button } from "../ui/button";

export function NewsletterSection() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<
    "idle" | "loading" | "success" | "error"
  >("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setStatus("loading");

    // TODO: wire to POST /newsletter endpoint in Phase 17
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
    setEmail("");
  };

  return (
    <section className="py-24 border-t border-border">
      <div className="max-w-6xl mx-auto px-6">
        <div
          className={cn(
            "relative overflow-hidden rounded-2xl p-12",
            "bg-card border border-border",
            "flex flex-col md:flex-row items-center justify-between gap-10",
          )}
        >
          {/* Background glow */}
          <div className="absolute top-0 right-0 w-[300px] h-[200px] bg-brand/5 blur-3xl pointer-events-none" />

          {/* Left */}
          <div className="relative space-y-3 max-w-md">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-brand" />
              <span className="text-xs font-semibold text-brand uppercase tracking-wider">
                Stay in the loop
              </span>
            </div>
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              New SDKs, features and tips — in your inbox.
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              We send occasional updates on new platform SDKs, product releases
              and observability best practices. No spam. Unsubscribe anytime.
            </p>
          </div>

          {/* Right — form */}
          <div className="relative w-full md:w-auto md:min-w-[340px]">
            {status === "success" ? (
              <div
                className={cn(
                  "flex items-center gap-3 p-4 rounded-xl",
                  "bg-brand/10 border border-brand/20",
                )}
              >
                <div className="w-8 h-8 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
                  <Zap className="w-4 h-4 text-brand" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-foreground">
                    You&apos;re on the list!
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    We&apos;ll be in touch when something worth reading drops.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="flex gap-2">
                  <input
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className={cn(
                      "flex-1 h-10 px-3 rounded-lg text-sm",
                      "bg-background border border-border",
                      "text-foreground placeholder:text-muted-foreground",
                      "focus:outline-none focus:ring-2 focus:ring-brand/30 focus:border-brand/50",
                      "transition-colors",
                    )}
                  />
                  <Button
                    type="submit"
                    disabled={status === "loading"}
                    className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold shrink-0"
                  >
                    {status === "loading" ? "..." : "Subscribe"}
                  </Button>
                </div>
                {status === "error" && (
                  <p className="text-xs text-destructive">
                    Something went wrong. Please try again.
                  </p>
                )}
                <p className="text-xs text-muted-foreground">
                  By subscribing you agree to our{" "}
                  <Link
                    href="/privacy-policy"
                    className="underline hover:text-foreground"
                  >
                    Privacy Policy
                  </Link>
                  . Unsubscribe at any time.
                </p>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
