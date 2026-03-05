"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { useAiConfig, useUpsertAiConfig, useDeleteAiConfig } from "@/hooks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  AIProvider,
  AIModel,
  CronPreset,
  PROVIDER_MODELS,
  PROVIDER_LABELS,
  MODEL_LABELS,
  CRON_PRESET_LABELS,
} from "@/types";
import {
  Brain,
  Key,
  Clock,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle2,
  Eye,
  EyeOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SettingsPage() {
  const params = useParams();
  const projectId = params?.projectId as string;

  const { data: aiConfig, isLoading } = useAiConfig(projectId);
  const upsertConfig = useUpsertAiConfig(projectId);
  const deleteConfig = useDeleteAiConfig(projectId);

  // ─── Form state ───────────────────────────────────────────────────────

  const [provider, setProvider] = useState<AIProvider>("anthropic");
  const [model, setModel] = useState<AIModel>("claude-sonnet-4-5");
  const [apiKey, setApiKey] = useState("");
  const [cronPreset, setCronPreset] = useState<CronPreset>("0 9 * * *");
  const [cronSchedule, setCronSchedule] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  // ─── Populate form from existing config ───────────────────────────────

  useEffect(() => {
    if (!aiConfig) return;

    const timeout = setTimeout(() => {
      setProvider(aiConfig.provider);
      setModel(aiConfig.model);

      const isPreset = Object.keys(CRON_PRESET_LABELS).includes(
        aiConfig.cronSchedule,
      );
      if (isPreset) {
        setCronPreset(aiConfig.cronSchedule as CronPreset);
      } else {
        setCronPreset("custom");
        setCronSchedule(aiConfig.cronSchedule);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [aiConfig]);

  // ─── Reset model when provider changes ────────────────────────────────

  useEffect(() => {
    const timeout = setTimeout(() => {
      const models = PROVIDER_MODELS[provider];
      if (!models.includes(model)) {
        setModel(models[0]);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [provider, model]);

  // ─── Handlers ─────────────────────────────────────────────────────────

  const handleSave = async () => {
    await upsertConfig.mutateAsync({
      provider,
      model,
      apiKey,
      cronPreset,
      cronSchedule: cronPreset === "custom" ? cronSchedule : undefined,
    });

    setApiKey("");
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const handleDelete = async () => {
    await deleteConfig.mutateAsync();
  };

  const handleProviderChange = (value: AIProvider) => {
    setProvider(value);
  };

  const isValid =
    provider &&
    model &&
    apiKey.trim().length > 0 &&
    (cronPreset !== "custom" || cronSchedule.trim().length > 0);

  // ─── Loading ──────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-2xl">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Configure AI provider and insights schedule for this project
        </p>
      </div>

      {/* No config banner */}
      {!aiConfig && (
        <div
          className={cn(
            "flex items-start gap-3 p-4 rounded-lg",
            "bg-yellow-500/10 border border-yellow-500/20",
          )}
        >
          <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-foreground">
              AI features are disabled
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Configure your AI provider below to enable crash insights and
              automated analysis.
            </p>
          </div>
        </div>
      )}

      {/* Current config summary */}
      {aiConfig && (
        <div
          className={cn(
            "flex items-start gap-3 p-4 rounded-lg",
            "bg-brand/10 border border-brand/20",
          )}
        >
          <CheckCircle2 className="w-5 h-5 text-brand shrink-0 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-foreground">
              AI features enabled
            </p>
            <p className="text-sm text-muted-foreground mt-0.5">
              Using {PROVIDER_LABELS[aiConfig.provider]} —{" "}
              {MODEL_LABELS[aiConfig.model as AIModel]} · API key ending in{" "}
              <code className="font-mono">••••{aiConfig.keyHint}</code>
            </p>
          </div>
          <Badge
            variant="outline"
            className="text-brand border-brand/30 shrink-0"
          >
            Active
          </Badge>
        </div>
      )}

      {/* AI Provider Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">AI Provider</CardTitle>
          </div>
          <CardDescription>
            Select your AI provider and enter your API key. Keys are encrypted
            at rest and never returned in full after saving.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider */}
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select
              value={provider}
              onValueChange={(v) => handleProviderChange(v as AIProvider)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
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

          {/* Model */}
          <div className="space-y-2">
            <Label>Model</Label>
            <Select value={model} onValueChange={(v) => setModel(v as AIModel)}>
              <SelectTrigger>
                <SelectValue placeholder="Select model" />
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

          {/* API Key */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Key className="w-3.5 h-3.5" />
              API Key
            </Label>
            <div className="relative">
              <Input
                type={showApiKey ? "text" : "password"}
                placeholder={
                  aiConfig
                    ? `Current key: ••••••••${aiConfig.keyHint} — enter new key to update`
                    : "Enter your API key"
                }
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="pr-10 font-mono text-sm"
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showApiKey ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              Your API key is encrypted using AES-256-GCM before being stored.
              Only the last 4 characters are shown after saving.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Configuration */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">Insights Schedule</CardTitle>
          </div>
          <CardDescription>
            Choose when AI insights are automatically generated. You can always
            trigger them manually regardless of schedule. Each run uses your AI
            provider API credits.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Preset */}
          <div className="space-y-2">
            <Label>Schedule</Label>
            <Select
              value={cronPreset}
              onValueChange={(v) => setCronPreset(v as CronPreset)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select schedule" />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(CRON_PRESET_LABELS) as CronPreset[]).map((p) => (
                  <SelectItem key={p} value={p}>
                    {CRON_PRESET_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Custom cron */}
          {cronPreset === "custom" && (
            <div className="space-y-2">
              <Label>Custom Cron Expression</Label>
              <Input
                placeholder="0 9 * * *"
                value={cronSchedule}
                onChange={(e) => setCronSchedule(e.target.value)}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Standard 5-field cron expression. e.g.{" "}
                <code className="font-mono">0 9 * * *</code> runs at 9am daily.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={!isValid || upsertConfig.isPending}
            className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            {upsertConfig.isPending ? "Saving..." : "Save Configuration"}
          </Button>

          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-brand">
              <CheckCircle2 className="w-4 h-4" />
              Saved successfully
            </div>
          )}

          {upsertConfig.isError && (
            <div className="flex items-center gap-1.5 text-sm text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Failed to save — check your inputs
            </div>
          )}
        </div>

        {/* Delete config */}
        {aiConfig && (
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Remove AI Config
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove AI configuration?</AlertDialogTitle>
                <AlertDialogDescription>
                  This will disable all AI features for this project including
                  automatic insight generation. Your existing insights will not
                  be deleted. You can reconfigure at any time.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  className="bg-destructive hover:bg-destructive/90 text-white"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        )}
      </div>
    </div>
  );
}
