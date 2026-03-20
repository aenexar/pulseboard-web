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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAiConfig, useDeleteAiConfig, useUpsertAiConfig } from "@/hooks";
import { cn } from "@/lib/utils";
import {
  AIModel,
  AIProvider,
  CRON_PRESET_LABELS,
  CronPreset,
  MODEL_LABELS,
  PROVIDER_LABELS,
  PROVIDER_MODELS,
} from "@/types";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  Key,
  Save,
  Trash2,
} from "lucide-react";
import { useEffect, useState } from "react";

export function AIConfigTab({
  slug,
  productSlug,
  projectId,
}: {
  slug: string;
  productSlug: string;
  projectId: string;
}) {
  const { data: aiConfig, isLoading } = useAiConfig(
    slug,
    productSlug,
    projectId,
  );
  const upsertConfig = useUpsertAiConfig(slug, productSlug, projectId);
  const deleteConfig = useDeleteAiConfig(slug, productSlug, projectId);

  const [provider, setProvider] = useState<AIProvider>("anthropic");
  const [model, setModel] = useState<AIModel>("claude-sonnet-4-5");
  const [apiKey, setApiKey] = useState("");
  const [cronPreset, setCronPreset] = useState<CronPreset>("0 9 * * *");
  const [cronSchedule, setCronSchedule] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!aiConfig) return;
    const t = setTimeout(() => {
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
    return () => clearTimeout(t);
  }, [aiConfig]);

  useEffect(() => {
    const t = setTimeout(() => {
      const models = PROVIDER_MODELS[provider];
      if (!models.includes(model)) setModel(models[0]);
    }, 0);
    return () => clearTimeout(t);
  }, [provider, model]);

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

  const isValid =
    provider &&
    model &&
    apiKey.trim().length > 0 &&
    (cronPreset !== "custom" || cronSchedule.trim().length > 0);

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      {!aiConfig ? (
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
              Configure your AI provider below to enable crash insights.
            </p>
          </div>
        </div>
      ) : (
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
              {PROVIDER_LABELS[aiConfig.provider]} — {aiConfig.model} · key
              ending in{" "}
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

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">AI Provider</CardTitle>
          </div>
          <CardDescription>
            Keys are encrypted using AES-256-GCM.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Provider</Label>
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
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">Insights Schedule</CardTitle>
          </div>
          <CardDescription>
            Choose when AI insights are automatically generated.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Schedule</Label>
            <Select
              value={cronPreset}
              onValueChange={(v) => setCronPreset(v as CronPreset)}
            >
              <SelectTrigger>
                <SelectValue />
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
          {cronPreset === "custom" && (
            <div className="space-y-2">
              <Label>Custom Cron Expression</Label>
              <Input
                placeholder="0 9 * * *"
                value={cronSchedule}
                onChange={(e) => setCronSchedule(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          )}
        </CardContent>
      </Card>

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
              Saved
            </div>
          )}
        </div>
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
                  This will disable all AI features. Existing insights will not
                  be deleted.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => deleteConfig.mutate()}
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
