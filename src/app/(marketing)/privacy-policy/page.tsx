import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import Link from "next/link";

const LAST_UPDATED = "March 14, 2026";
const CONTACT_EMAIL = "privacy@pulseboard.app";

const sections = [
  {
    title: "1. Introduction",
    content: `PulseBoard ("we", "us", or "our") is committed to protecting your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our Service. Please read this policy carefully. If you disagree with its terms, please discontinue use of the Service.`,
  },
  {
    title: "2. Information We Collect",
    content: `We collect information you provide directly: name, email address, and password when you register; payment information processed by Stripe (we never store raw card data); organisation and project details you create; and communications you send us. We also collect information automatically: log data (IP address, browser type, pages visited, time spent); device information; usage patterns within the dashboard; and crash and performance data you send via our SDKs on behalf of your end users.`,
  },
  {
    title: "3. SDK Data and Your End Users",
    content: `When you integrate a PulseBoard SDK into your application, data about your end users (such as device model, OS version, session identifiers, and crash details) is transmitted to our servers. You are the data controller for this information. You are responsible for ensuring your own privacy policy informs your end users that this data is collected and transmitted to a third-party monitoring service. PulseBoard acts as a data processor for this data on your behalf.`,
  },
  {
    title: "4. How We Use Your Information",
    content: `We use the information we collect to: provide, operate, and maintain the Service; process transactions and send related information; send administrative messages, security alerts, and support responses; send product updates and announcements (only if you opted in); analyse usage to improve the Service; detect and prevent fraudulent or abusive activity; and comply with legal obligations.`,
  },
  {
    title: "5. AI Features and API Keys",
    content: `If you use the AI insights feature, your AI provider API key is encrypted at rest using AES-256-GCM encryption. Only the last 4 characters are displayed in the dashboard. Your API key is transmitted only to the AI provider you select when generating insights. We do not use your API key for any other purpose and do not share it with any third party other than your chosen AI provider.`,
  },
  {
    title: "6. Data Retention",
    content: `We retain your account data for as long as your account is active or as needed to provide the Service. Raw event and analytics data is retained according to your plan: 7 days for Starter, 30 days for Pro, and custom retention for Enterprise. After account deletion, we retain your data for 30 days before permanent deletion. Some information may be retained longer where required by law.`,
  },
  {
    title: "7. Sharing of Information",
    content: `We do not sell, trade, or rent your personal information to third parties. We may share your information with: service providers who assist in operating the Service (such as Stripe for payments, Resend for email, and Redis/PostgreSQL hosting providers) under confidentiality obligations; law enforcement or government agencies when required by law; and business successors in the event of a merger, acquisition, or sale of assets, with prior notice to you.`,
  },
  {
    title: "8. Cookies and Tracking",
    content: `We use a single authentication cookie (pb_access_token) to maintain your session. We do not use advertising cookies or third-party tracking pixels. We do not use Google Analytics or similar third-party analytics services. Usage analytics are collected first-party and used solely to improve the Service.`,
  },
  {
    title: "9. Security",
    content: `We implement industry-standard security measures including TLS encryption for data in transit, AES-256-GCM encryption for sensitive credentials, bcrypt hashing for passwords, and JWT-based authentication with short-lived access tokens and rotating refresh tokens. No method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.`,
  },
  {
    title: "10. Your Rights",
    content: `Depending on your location, you may have rights including: access to the personal data we hold about you; correction of inaccurate data; deletion of your data (right to be forgotten); portability of your data in a machine-readable format; and objection to or restriction of certain processing. To exercise any of these rights, contact us at the email below. We will respond within 30 days.`,
  },
  {
    title: "11. Children's Privacy",
    content: `The Service is not directed to individuals under the age of 16. We do not knowingly collect personal information from children under 16. If you become aware that a child has provided us with personal information, please contact us and we will take steps to delete such information.`,
  },
  {
    title: "12. International Transfers",
    content: `Your information may be transferred to and maintained on servers located outside your country of residence. By using the Service, you consent to such transfer. We take appropriate steps to ensure that your data is treated securely and in accordance with this Privacy Policy wherever it is processed.`,
  },
  {
    title: "13. Changes to This Policy",
    content: `We may update this Privacy Policy from time to time. We will notify you of any material changes by email or via a prominent notice within the Service at least 14 days before the change takes effect. Your continued use of the Service after the effective date constitutes your acceptance of the updated policy.`,
  },
  {
    title: "14. Contact Us",
    content: `If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact our privacy team at ${CONTACT_EMAIL}. We will respond to all legitimate requests within 30 days.`,
  },
];

export default function PrivacyPolicyPage() {
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
            Privacy Policy
          </h1>
          <p className="text-muted-foreground">Last updated: {LAST_UPDATED}</p>
        </div>
      </section>

      {/* ── Content ──────────────────────────────────────────────── */}
      <section className="py-16">
        <div className="max-w-3xl mx-auto px-6 space-y-10">
          {/* Intro */}
          <p className="text-muted-foreground leading-relaxed">
            Your privacy matters to us. This policy describes exactly what data
            we collect, why we collect it, and how you can control it. We have
            written this in plain language — no legalese where it can be
            avoided.
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
              Privacy questions? Email{" "}
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="text-brand hover:underline"
              >
                {CONTACT_EMAIL}
              </a>
            </p>
            <Link
              href="/terms-and-conditions"
              className="text-sm text-brand hover:underline"
            >
              Terms and Conditions →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
