"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSupportContact } from "@/hooks/useSupport";
import { cn } from "@/lib/utils";
import {
  BookOpen,
  Github,
  Mail,
  MessageCircle,
  Sparkles,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

const SUPPORT_EMAIL = "support@pulseboard.app";

const RESOURCES = [
  {
    icon: BookOpen,
    title: "Documentation",
    description:
      "SDK integration guides, API reference, and dashboard walkthrough.",
    href: "/docs",
    cta: "Browse docs",
    external: false,
  },
  {
    icon: Github,
    title: "GitHub Issues",
    description:
      "Found a bug in the SDK? Open an issue on our public repository.",
    href: "https://github.com/aenexar/pulseboard-react-native/issues",
    cta: "Open an issue",
    external: true,
  },
  {
    icon: Mail,
    title: "Email Support",
    description: "For billing, account, and private technical issues.",
    href: `mailto:${SUPPORT_EMAIL}`,
    cta: "Send an email",
    external: true,
  },
];

const FAQS = [
  {
    q: "How do I reset my API key?",
    a: "Go to your project settings and click the Security tab. You can regenerate your API key there — note that the old key will stop working immediately.",
  },
  {
    q: "Why are my events not appearing in the dashboard?",
    a: "Check that PulseBoard.init() is called before any events are sent, and that your API key is correct. Events may take up to 5 seconds to appear in the live feed.",
  },
  {
    q: "How do I cancel my subscription?",
    a: "Go to your organisation settings, click the Billing tab, and click Manage Subscription. You'll be redirected to Stripe's customer portal where you can cancel.",
  },
  {
    q: "Can I export my data?",
    a: "Data export is on our roadmap. In the meantime, contact us at support@pulseboard.app and we'll prepare an export for you within 48 hours.",
  },
  {
    q: "What happens to my data when I delete a project?",
    a: "All associated data — events, crashes, sessions, insights and AI configuration — is permanently deleted immediately. This action cannot be undone.",
  },
  {
    q: "I invited a team member but they didn't receive the email.",
    a: "Ask them to check their spam folder. Invitation emails are sent from onboarding@resend.dev. If it's still not there after 5 minutes, cancel the invitation and resend it.",
  },
];

export default function SupportPage() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const contact = useSupportContact();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    contact.mutate(form);
  };

  const handleFormReset = () => {
    contact.reset();
    setForm({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <main className="pt-14">
      {/* ── Hero ─────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div
          className={cn(
            "absolute inset-0 pointer-events-none",
            "[background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)]",
            "[background-size:48px_48px] opacity-40",
          )}
        />
        <div className="relative max-w-3xl mx-auto px-6 py-20 text-center space-y-4">
          <Badge variant="outline" className="text-brand border-brand/30">
            Support
          </Badge>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            How can we help?
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Browse the resources below, check the FAQ, or send us a message. We
            typically respond within one business day.
          </p>
        </div>
      </section>

      {/* ── Resources ────────────────────────────────────────────── */}
      <section className="py-16 border-b border-border">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {RESOURCES.map((resource) => {
              const Icon = resource.icon;
              return (
                <div
                  key={resource.title}
                  className="p-6 rounded-xl border border-border bg-card space-y-4 hover:border-brand/30 transition-colors"
                >
                  <div className="w-10 h-10 rounded-lg bg-brand/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-brand" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="text-sm font-semibold text-foreground">
                      {resource.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {resource.description}
                    </p>
                  </div>
                  <Link
                    href={resource.href}
                    target={resource.external ? "_blank" : undefined}
                    className="text-sm text-brand hover:underline font-medium"
                  >
                    {resource.cta} →
                  </Link>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────────── */}
      <section className="py-16 border-b border-border bg-muted/30">
        <div className="max-w-3xl mx-auto px-6 space-y-8">
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-foreground tracking-tight">
              Frequently asked questions
            </h2>
            <p className="text-muted-foreground text-sm">
              Quick answers to the most common questions.
            </p>
          </div>
          <div className="space-y-4">
            {FAQS.map(({ q, a }) => (
              <div
                key={q}
                className="rounded-xl border border-border bg-card p-5 space-y-2"
              >
                <p className="text-sm font-semibold text-foreground">{q}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Contact Form ─────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-2xl mx-auto px-6 space-y-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-brand" />
              <h2 className="text-2xl font-bold text-foreground tracking-tight">
                Send us a message
              </h2>
            </div>
            <p className="text-sm text-muted-foreground">
              Can&apos;t find what you&apos;re looking for? We&apos;ll get back
              to you within one business day.
            </p>
          </div>

          {contact.isSuccess ? (
            <div
              className={cn(
                "flex items-start gap-4 p-6 rounded-xl",
                "bg-brand/10 border border-brand/20",
              )}
            >
              <div className="w-10 h-10 rounded-full bg-brand/20 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-brand" />
              </div>
              <div className="space-y-3 flex-1">
                <div className="space-y-1">
                  <p className="text-sm font-semibold text-foreground">
                    Message received!
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Thanks for reaching out. We&apos;ll reply to{" "}
                    <span className="font-medium text-foreground">
                      {form.email}
                    </span>{" "}
                    within one business day.
                  </p>
                </div>
                <Button variant="outline" size="sm" onClick={handleFormReset}>
                  Send another message
                </Button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={(e) =>
                      setForm({ ...form, email: e.target.value })
                    }
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="e.g. Billing question, SDK integration help"
                  value={form.subject}
                  onChange={(e) =>
                    setForm({ ...form, subject: e.target.value })
                  }
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Describe your issue in as much detail as possible..."
                  value={form.message}
                  onChange={(e) =>
                    setForm({ ...form, message: e.target.value })
                  }
                  required
                  rows={6}
                  className="resize-none"
                />
              </div>

              {contact.error && (
                <p className="text-sm text-destructive">
                  Something went wrong. Please try again or email us directly at{" "}
                  <a href={`mailto:${SUPPORT_EMAIL}`} className="underline">
                    {SUPPORT_EMAIL}
                  </a>
                </p>
              )}

              <Button
                type="submit"
                disabled={contact.isPending}
                className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
              >
                <Zap className="w-4 h-4 mr-2" />
                {contact.isPending ? "Sending..." : "Send message"}
              </Button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
