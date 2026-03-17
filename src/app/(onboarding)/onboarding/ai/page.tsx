"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpsertAiConfig } from "@/hooks";
import { cn } from "@/lib/utils";
import { useOnboardingStore } from "@/store/onboarding.store";
import {
  AIModel,
  AIProvider,
  MODEL_LABELS,
  PROVIDER_LABELS,
  PROVIDER_MODELS,
} from "@/types";
import { Brain, ChevronRight, Eye, EyeOff, SkipForward } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function OnboardingAIPage() {
  const router = useRouter();
  const { slug, productSlug, projectId } = useOnboardingStore();

  const upsertConfig = useUpsertAiConfig(
    slug ?? "",
    productSlug ?? "",
    projectId ?? "",
  );

  const [provider, setProvider] = useState<AIProvider>("anthropic");
  const [model, setModel] = useState<AIModel>("claude-sonnet-4-5");
  const [apiKey, setApiKey] = useState("");
  const [showKey, setShowKey] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    const models = PROVIDER_MODELS[provider];
    if (!models.includes(model)) {
      timeout = setTimeout(() => {
        setModel(models[0]);
      }, 0);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [provider, model]);

  const handleSave = async () => {
    await upsertConfig.mutateAsync({
      provider,
      model,
      apiKey,
      cronPreset: "0 9 * * *",
    });
    router.push("/onboarding/done");
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-8">
      <div
        className={cn(
          "fixed inset-0 pointer-events-none",
          "[background-image:linear-gradient(var(--border)_1px,transparent_1px),linear-gradient(90deg,var(--border)_1px,transparent_1px)]",
          "[background-size:48px_48px] opacity-30",
        )}
      />

      <div className="relative w-full max-w-md space-y-8">
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
              <Brain className="w-7 h-7 text-brand" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Configure AI insights
          </h1>
          <p className="text-sm text-muted-foreground">
            Bring your own API key to unlock daily AI analysis. You can always
            set this up later.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>AI Provider</Label>
            <Select
              value={provider}
              onValueChange={(v) => setProvider(v as AIProvider)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(PROVIDER_LABELS) as AIProvider[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {PROVIDER_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={(v) => setModel(v as AIModel)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PROVIDER_MODELS[provider].map((m) => (
                  <SelectItem key={m} value={m}>
                    {MODEL_LABELS[m]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>API Key</Label>
            <div className="relative">
              <Input
                type={showKey ? "text" : "password"}
                placeholder="Enter your API key"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowKey(!showKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Encrypted at rest using AES-256-GCM. Only the last 4 characters
              are shown after saving.
            </p>
          </div>
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step 4 of 4</span>
            <span>100%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-full bg-brand rounded-full transition-all duration-500" />
          </div>
        </div>

        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/onboarding/done")}
            className="flex-1 text-muted-foreground"
          >
            <SkipForward className="w-4 h-4 mr-2" />
            Skip for now
          </Button>
          <Button
            onClick={handleSave}
            disabled={!apiKey.trim() || upsertConfig.isPending}
            className="flex-1 bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
          >
            {upsertConfig.isPending ? "Saving..." : "Save & finish"}
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </div>
  );
}
