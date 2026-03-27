"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useProject } from "@/hooks";
import { cn } from "@/lib/utils";
import { Framework, FRAMEWORK_LABELS } from "@/types";
import { Check, Copy, Eye, EyeOff, Terminal } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

// ─── Code block ───────────────────────────────────────────────────────────────

function CodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-1.5">
      {label && (
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
      )}
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

// ─── API key row ──────────────────────────────────────────────────────────────

function ApiKeyRow({ apiKey }: { apiKey: string }) {
  const [visible, setVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  const copy = () => {
    navigator.clipboard.writeText(apiKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="flex items-center gap-2 p-3 rounded-lg bg-muted border border-border">
      <code className="flex-1 text-xs font-mono text-foreground truncate">
        {visible ? apiKey : "•".repeat(32)}
      </code>
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        {visible ? (
          <EyeOff className="w-3.5 h-3.5" />
        ) : (
          <Eye className="w-3.5 h-3.5" />
        )}
      </button>
      <button
        type="button"
        onClick={copy}
        className="p-1.5 rounded-md text-muted-foreground hover:text-foreground transition-colors shrink-0"
      >
        {copied ? (
          <Check className="w-3.5 h-3.5 text-brand" />
        ) : (
          <Copy className="w-3.5 h-3.5" />
        )}
      </button>
    </div>
  );
}

// ─── Framework-specific content ───────────────────────────────────────────────

const INSTALL_COMMANDS: Partial<Record<Framework, string>> = {
  "react-native-cli": "npm install @pulseboard/react-native",
  "react-native-expo": "npx expo install @pulseboard/react-native",
  flutter: "flutter pub add pulseboard_flutter",
  ionic: "npm install @pulseboard/ionic",
  react: "npm install @pulseboard/web",
  nextjs: "npm install @pulseboard/web",
  vue: "npm install @pulseboard/web",
  angular: "npm install @pulseboard/web",
  nuxt: "npm install @pulseboard/web",
  electron: "npm install @pulseboard/web",
};

function getInstallCommand(framework: Framework | null): string {
  if (!framework) return "npm install @pulseboard/react-native";
  return INSTALL_COMMANDS[framework] ?? "npm install @pulseboard/react-native";
}

function getInitCode(framework: Framework | null, apiKey: string): string {
  const key = apiKey || "your_api_key";

  if (framework === "react-native-expo" || framework === "react-native-cli") {
    return `import PulseBoard from '@pulseboard/react-native'

// Call this in your app entry point (App.tsx or index.js)
PulseBoard.init({
  apiKey:      '${key}',
  environment: __DEV__ ? 'development' : 'production',
})`;
  }

  if (framework === "flutter") {
    return `import 'package:pulseboard_flutter/pulseboard_flutter.dart';

// Call this in your main() function
await PulseBoard.init(
  apiKey:      '${key}',
  environment: kReleaseMode ? 'production' : 'development',
);`;
  }

  if (
    framework &&
    ["react", "nextjs", "vue", "angular", "nuxt"].includes(framework)
  ) {
    return `import PulseBoard from '@pulseboard/web'

// Call this once at app initialisation
PulseBoard.init({
  apiKey:      '${key}',
  environment: process.env.NODE_ENV === 'production' ? 'production' : 'development',
})`;
  }

  return `import PulseBoard from '@pulseboard/react-native'

PulseBoard.init({
  apiKey:      '${key}',
  environment: 'production',
})`;
}

function getUsageCode(framework: Framework | null): string {
  if (framework === "flutter") {
    return `// Track a custom event
await PulseBoard.track('button_tapped', properties: {
  'screen': 'HomeScreen',
  'button': 'purchase',
});

// Capture an error manually
try {
  // your code
} catch (e, stackTrace) {
  await PulseBoard.captureError(e, stackTrace: stackTrace);
}

// Add a log
PulseBoard.log('User completed checkout', level: LogLevel.info);`;
  }

  return `// Track a custom event
PulseBoard.track('button_tapped', {
  screen: 'HomeScreen',
  button: 'purchase',
})

// Capture an error manually
try {
  // your code
} catch (err) {
  PulseBoard.captureError(err)
}

// Add a log
PulseBoard.log('User completed checkout', { level: 'info' })`;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SetupPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;
  const projectId = params?.id as string;

  const { data: project, isLoading } = useProject(slug, productSlug, projectId);

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-32" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  const framework = (project?.framework ?? null) as Framework | null;
  const apiKey = project?.apiKey ?? "";
  const installCmd = getInstallCommand(framework);
  const initCode = getInitCode(framework, apiKey);
  const usageCode = getUsageCode(framework);
  const fwLabel = framework
    ? (FRAMEWORK_LABELS[framework] ?? framework)
    : "your app";

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-foreground">Setup guide</h1>
          {framework && (
            <Badge variant="outline" className="text-brand border-brand/30">
              {fwLabel}
            </Badge>
          )}
        </div>
        <p className="text-muted-foreground mt-1">
          Everything you need to start sending events from {fwLabel}.
        </p>
      </div>

      {/* API Key */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-brand">1</span>
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Your API key
          </h2>
        </div>
        <ApiKeyRow apiKey={apiKey} />
        <p className="text-xs text-muted-foreground">
          This key identifies your project. Keep it private — treat it like a
          password. Rotate it anytime in{" "}
          <span className="text-foreground">Settings → Security</span>.
        </p>
      </div>

      {/* Install */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-brand">2</span>
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Install the SDK
          </h2>
        </div>
        <CodeBlock code={installCmd} />
      </div>

      {/* Initialise */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-brand">3</span>
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Initialise in your entry point
          </h2>
        </div>
        <CodeBlock code={initCode} />
        <div className="flex items-start gap-2.5 p-3 rounded-lg bg-brand/5 border border-brand/20">
          <Check className="w-4 h-4 text-brand shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground">
            Your API key is pre-filled. Crashes, sessions and events will start
            appearing in your dashboard immediately after initialisation.
          </p>
        </div>
      </div>

      {/* Usage */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-brand/10 border border-brand/20 flex items-center justify-center shrink-0">
            <span className="text-xs font-bold text-brand">4</span>
          </div>
          <h2 className="text-sm font-semibold text-foreground">
            Track events and errors
          </h2>
        </div>
        <CodeBlock code={usageCode} />
      </div>

      {/* What's automatic */}
      <div className="p-4 rounded-xl border border-border bg-card space-y-3">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-brand" />
          <p className="text-sm font-semibold text-foreground">
            Captured automatically
          </p>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {[
            "Unhandled crashes",
            "Session start / end",
            "App version & build",
            "Device model & OS",
            "Network connectivity",
            "App foreground / background",
          ].map((item) => (
            <div key={item} className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5 text-brand shrink-0" />
              <span className="text-xs text-muted-foreground">{item}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Next step CTA */}
      <div className="flex items-center gap-3 p-4 rounded-xl border border-border bg-card">
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">
            Ready to unlock AI insights?
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure your AI provider in settings to get daily analysis.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            (window.location.href = `/${slug}/products/${productSlug}/projects/${projectId}/settings/ai`)
          }
        >
          Configure AI
        </Button>
      </div>
    </div>
  );
}
