"use client";

import { Button } from "@/components/ui/button";
import { useOnboardingStore } from "@/store/onboarding.store";
import { cn } from "@/lib/utils";
import { FRAMEWORK_LABELS, Framework } from "@/types";
import { Check, ChevronRight, Copy, Terminal } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

function CodeBlock({ code, label }: { code: string; label: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="relative group">
        <pre
          className={cn(
            "text-xs font-mono p-4 rounded-xl pr-12 overflow-x-auto",
            "bg-muted border border-border text-foreground leading-relaxed",
          )}
        >
          {code}
        </pre>
        <button
          type="button"
          onClick={copy}
          className="absolute right-3 top-3 p-1.5 rounded-md bg-background border border-border text-muted-foreground hover:text-foreground transition-colors"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-brand" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}

const INSTALL_COMMANDS: Partial<Record<Framework, string>> = {
  "react-native-cli": "npm install @pulseboard/react-native",
  "react-native-expo": "npx expo install @pulseboard/react-native",
  flutter: "flutter pub add pulseboard_flutter",
  ionic: "npm install @pulseboard/ionic",
};

export default function OnboardingSDKPage() {
  const router = useRouter();
  const { apiKey, framework } = useOnboardingStore();

  const installCmd = framework
    ? (INSTALL_COMMANDS[framework] ?? "npm install @pulseboard/react-native")
    : "npm install @pulseboard/react-native";

  const frameworkLabel = framework
    ? (FRAMEWORK_LABELS[framework] ?? framework)
    : "React Native";

  const initCode = `import PulseBoard from '@pulseboard/react-native';

PulseBoard.init({
  apiKey: '${apiKey ?? "your_api_key"}',
  environment: 'production',
});`;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div
        className={cn(
          "fixed inset-0 pointer-events-none",
          "[background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)]",
          "[background-size:48px_48px] opacity-30",
        )}
      />

      <div className="relative w-full max-w-lg space-y-8">
        {/* Logo */}
        <div className="flex items-center justify-center gap-2">
          <div className="w-2 h-2 rounded-full bg-brand animate-pulse" />
          <span className="text-sm font-mono font-semibold text-foreground">
            PulseBoard
          </span>
        </div>

        {/* Heading */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center">
            <div className="w-14 h-14 rounded-2xl bg-brand/10 border border-brand/20 flex items-center justify-center">
              <Terminal className="w-7 h-7 text-brand" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Install the SDK
          </h1>
          <p className="text-sm text-muted-foreground">
            Add PulseBoard to your {frameworkLabel} app.
          </p>
        </div>

        {/* Code blocks */}
        <div className="space-y-5">
          <CodeBlock label="1. Install the package" code={installCmd} />
          <CodeBlock
            label="2. Initialise in your app entry point"
            code={initCode}
          />
          <div
            className={cn(
              "flex items-start gap-3 p-4 rounded-xl",
              "bg-brand/10 border border-brand/20",
            )}
          >
            <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
            <p className="text-sm text-muted-foreground">
              Your API key is pre-filled above. Keep it secret — it identifies
              your project when events are sent.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step 3 of 4</span>
            <span>75%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-3/4 bg-brand rounded-full transition-all duration-500" />
          </div>
        </div>

        <Button
          onClick={() => router.push("/onboarding/ai")}
          className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold h-11"
        >
          I&apos;ve installed it
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
