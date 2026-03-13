import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

const LAST_UPDATED = "March 14, 2026";
const CONTACT_EMAIL = "legal@pulseboard.app";

const sections = [
  {
    title: "1. Acceptance of Terms",
    content: `By accessing or using PulseBoard ("the Service"), you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the Service. These terms apply to all visitors, users, and others who access or use the Service.`,
  },
  {
    title: "2. Description of Service",
    content: `PulseBoard provides mobile application monitoring, crash analytics, real-time event tracking, and AI-powered insight generation. The Service is provided on a subscription basis with both free and paid tiers as described on our pricing page.`,
  },
  {
    title: "3. Accounts and Registration",
    content: `You must create an account to use most features of the Service. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account. You agree to notify us immediately of any unauthorised use of your account. You must provide accurate and complete information when creating your account and keep it up to date.`,
  },
  {
    title: "4. Acceptable Use",
    content: `You agree not to use the Service to: (a) violate any applicable laws or regulations; (b) transmit any harmful, offensive, or disruptive content; (c) attempt to gain unauthorised access to any part of the Service or its infrastructure; (d) reverse engineer, decompile, or disassemble any part of the Service; (e) use the Service to monitor applications you do not own or have permission to monitor; or (f) resell or sublicense the Service without our written consent.`,
  },
  {
    title: "5. Subscription and Billing",
    content: `Paid plans are billed in advance on a monthly or annual basis. All fees are non-refundable except as required by law. We reserve the right to change our pricing with 30 days' notice. Failure to pay may result in suspension or termination of your account. Stripe processes all payments — PulseBoard does not store your payment card details.`,
  },
  {
    title: "6. Free Plan Limitations",
    content: `The free Starter plan is provided as-is with the limitations described on the pricing page. We reserve the right to modify or discontinue the free plan at any time with reasonable notice. Excessive use of the free plan that impacts service performance for other users may result in account suspension.`,
  },
  {
    title: "7. Data and Privacy",
    content: `Your use of the Service is also governed by our Privacy Policy, which is incorporated by reference into these Terms. By using the Service, you consent to the collection and use of your data as described in the Privacy Policy. You retain ownership of all data you submit to the Service. You grant PulseBoard a limited licence to process that data solely to provide the Service.`,
  },
  {
    title: "8. AI Features and Third-Party API Keys",
    content: `The AI insights feature requires you to provide your own API key from a supported AI provider (Anthropic, OpenAI, Google, or Moonshot). Your API key is encrypted at rest using AES-256-GCM. PulseBoard does not share your API key with third parties beyond the AI provider you select. You are responsible for any costs incurred with your chosen AI provider.`,
  },
  {
    title: "9. Intellectual Property",
    content: `The Service and its original content, features, and functionality are and will remain the exclusive property of PulseBoard and its licensors. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of PulseBoard. SDK packages published under open-source licences are governed by their respective licence files.`,
  },
  {
    title: "10. Termination",
    content: `We may terminate or suspend your account immediately, without prior notice or liability, for any reason, including if you breach these Terms. Upon termination, your right to use the Service ceases immediately. You may delete your account at any time from your organisation settings. We will retain your data for 30 days after termination before permanent deletion.`,
  },
  {
    title: "11. Disclaimers",
    content: `The Service is provided on an "AS IS" and "AS AVAILABLE" basis without warranties of any kind, either express or implied. PulseBoard does not warrant that the Service will be uninterrupted, error-free, or free of harmful components. We do not warrant the accuracy or completeness of AI-generated insights — they are provided for informational purposes only and should not be relied upon as the sole basis for technical decisions.`,
  },
  {
    title: "12. Limitation of Liability",
    content: `To the maximum extent permitted by applicable law, PulseBoard shall not be liable for any indirect, incidental, special, consequential, or punitive damages, or any loss of profits or revenues, whether incurred directly or indirectly. Our total liability for any claim arising out of or relating to the Service shall not exceed the amount you paid us in the 12 months preceding the claim.`,
  },
  {
    title: "13. Changes to Terms",
    content: `We reserve the right to modify these Terms at any time. We will provide at least 14 days' notice of material changes via email or a prominent notice within the Service. Your continued use of the Service after the effective date of the revised Terms constitutes your acceptance of the changes.`,
  },
  {
    title: "14. Governing Law",
    content: `These Terms shall be governed by and construed in accordance with applicable law. Any disputes arising under these Terms shall be subject to the exclusive jurisdiction of the competent courts of the jurisdiction in which PulseBoard is incorporated.`,
  },
  {
    title: "15. Contact",
    content: `If you have any questions about these Terms, please contact us at ${CONTACT_EMAIL}.`,
  },
];

export default function TermsAndConditionsPage() {
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
            Legal
          </Badge>
          <h1 className="text-4xl font-bold text-foreground tracking-tight">
            Terms and Conditions
          </h1>
          <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          {/* Intro */}
          <p className="text-muted-foreground leading-relaxed">
            Please read these Terms and Conditions carefully before using
            PulseBoard. These terms constitute a legally binding agreement
            between you and PulseBoard regarding your use of the Service.
          </p>

          {/* Sections */}
          {sections.map((section) => (
            <div key={section.title} className="space-y-3">
              <h2 className="text-base font-semibold text-foreground">
                {section.title}
              </h2>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {section.content}
              </p>
            </div>
          ))}

          {/* Footer links */}
          <div className="pt-8 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <p className="text-sm text-muted-foreground">
              Questions? Email us at{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-brand hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
            <Link
              href="/privacy-policy"
              className="text-sm text-brand hover:underline"
            >
              Privacy Policy →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
