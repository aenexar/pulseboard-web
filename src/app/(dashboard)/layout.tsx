import { EmailVerificationBanner } from "@/components/layout/email-verification-banner";
import { Navbar } from "@/components/layout/navbar";
import { Sidebar } from "@/components/layout/sidebar";
import { OnboardingChecklist } from "@/components/onboarding/onboarding-checklist";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Navbar />
        <EmailVerificationBanner />
        <main className="flex-1 overflow-auto p-8">{children}</main>
      </div>
      <OnboardingChecklist />
    </div>
  );
}
