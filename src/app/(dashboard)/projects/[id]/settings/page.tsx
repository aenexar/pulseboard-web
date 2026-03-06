"use client";

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
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  useAiConfig,
  useDeleteAiConfig,
  useDeleteProject,
  useProject,
  useUpdateProject,
  useUpdateRepository,
  useUpsertAiConfig,
} from "@/hooks";
import { cn } from "@/lib/utils";
import {
  AIModel,
  AIProvider,
  CRON_PRESET_LABELS,
  CronPreset,
  Framework,
  FRAMEWORK_GROUPS,
  FRAMEWORK_LABELS,
  MODEL_LABELS,
  PROVIDER_LABELS,
  PROVIDER_MODELS,
  REPOSITORY_PROVIDER_LABELS,
  RepositoryProvider,
} from "@/types";
import {
  AlertTriangle,
  Brain,
  CheckCircle2,
  Clock,
  Eye,
  EyeOff,
  FolderGit2,
  GitBranch,
  Key,
  Save,
  Settings2,
  Shield,
  Trash2,
} from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

// ─── Project Details Tab ──────────────────────────────────────────────────────

function ProjectDetailsTab({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useProject(projectId);
  const updateProject = useUpdateProject(projectId);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [framework, setFramework] = useState<Framework | "">("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!project) return;
    const t = setTimeout(() => {
      setName(project.name ?? "");
      setDescription(project.description ?? "");
      setFramework((project.framework as Framework) ?? "");
    }, 0);
    return () => clearTimeout(t);
  }, [project]);

  const handleSave = async () => {
    await updateProject.mutateAsync({
      name: name.trim(),
      description: description.trim(),
      framework: framework || undefined,
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Settings2 className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">Project Details</CardTitle>
          </div>
          <CardDescription>
            Basic information about your project shown across the dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Name */}
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Mobile App"
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="A short description of what this project monitors..."
              className="resize-none"
              rows={3}
            />
            <p className="text-xs text-muted-foreground">
              Helps AI insights understand the context of your project for more
              accurate analysis.
            </p>
          </div>

          {/* Framework */}
          <div className="space-y-2">
            <Label>Framework</Label>
            <Select
              value={framework}
              onValueChange={(v) => setFramework(v as Framework)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select your framework" />
              </SelectTrigger>
              <SelectContent>
                {FRAMEWORK_GROUPS.map((group) => (
                  <SelectGroup key={group.label}>
                    <SelectLabel>{group.label}</SelectLabel>
                    {group.frameworks.map((f) => (
                      <SelectItem key={f} value={f}>
                        {FRAMEWORK_LABELS[f]}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              Used to tailor SDK documentation and insight recommendations.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Save */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!name.trim() || updateProject.isPending}
          className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateProject.isPending ? "Saving..." : "Save Changes"}
        </Button>
        {saved && (
          <div className="flex items-center gap-1.5 text-sm text-brand">
            <CheckCircle2 className="w-4 h-4" />
            Saved
          </div>
        )}
        {updateProject.isError && (
          <div className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4" />
            Failed to save
          </div>
        )}
      </div>
    </div>
  );
}

// ─── AI Config Tab ────────────────────────────────────────────────────────────

function AIConfigTab({ projectId }: { projectId: string }) {
  const { data: aiConfig, isLoading } = useAiConfig(projectId);
  const upsertConfig = useUpsertAiConfig(projectId);
  const deleteConfig = useDeleteAiConfig(projectId);

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
      {/* Status banner */}
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
              {PROVIDER_LABELS[aiConfig.provider]} —{" "}
              {MODEL_LABELS[aiConfig.model as AIModel]} · key ending in{" "}
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

      {/* Provider */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">AI Provider</CardTitle>
          </div>
          <CardDescription>
            Keys are encrypted using AES-256-GCM. Only the last 4 characters are
            shown after saving.
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

      {/* Schedule */}
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

// ─── Repository Tab ───────────────────────────────────────────────────────────

function RepositoryTab({ projectId }: { projectId: string }) {
  const { data: project, isLoading } = useProject(projectId);
  const updateRepository = useUpdateRepository(projectId);

  const [provider, setProvider] = useState<RepositoryProvider>("github");
  const [url, setUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!project?.repository) return;
    const t = setTimeout(() => {
      setProvider(project.repository!.provider);
      setUrl(project.repository!.url);
      setBranch(project.repository!.branch);
    }, 0);
    return () => clearTimeout(t);
  }, [project]);

  const handleSave = async () => {
    await updateRepository.mutateAsync({ provider, url, branch });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const isValid = url.trim().length > 0 && branch.trim().length > 0;

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">Repository</CardTitle>
          </div>
          <CardDescription>
            Connect your source repository to enable code-level crash analysis
            in future AI insights.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Provider */}
          <div className="space-y-2">
            <Label>Provider</Label>
            <Select
              value={provider}
              onValueChange={(v) => setProvider(v as RepositoryProvider)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(
                  Object.keys(
                    REPOSITORY_PROVIDER_LABELS,
                  ) as RepositoryProvider[]
                ).map((p) => (
                  <SelectItem key={p} value={p}>
                    {REPOSITORY_PROVIDER_LABELS[p]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* URL */}
          <div className="space-y-2">
            <Label>Repository URL</Label>
            <Input
              placeholder="https://github.com/yourorg/your-repo"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {/* Branch */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <GitBranch className="w-3.5 h-3.5" />
              Default Branch
            </Label>
            <Input
              placeholder="main"
              value={branch}
              onChange={(e) => setBranch(e.target.value)}
              className="font-mono text-sm"
            />
          </div>

          {!project?.repository && (
            <div
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg",
                "bg-muted border border-border",
              )}
            >
              <FolderGit2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  No repository connected
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Connecting your repository will allow AI insights to reference
                  specific files and line numbers in future crash analysis.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!isValid || updateRepository.isPending}
          className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateRepository.isPending ? "Saving..." : "Save Repository"}
        </Button>
        {saved && (
          <div className="flex items-center gap-1.5 text-sm text-brand">
            <CheckCircle2 className="w-4 h-4" />
            Saved
          </div>
        )}
        {updateRepository.isError && (
          <div className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4" />
            Failed to save
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Security Tab ─────────────────────────────────────────────────────────────

function SecurityTab({ projectId }: { projectId: string }) {
  const router = useRouter();
  const deleteProject = useDeleteProject(projectId);

  const handleDelete = async () => {
    await deleteProject.mutateAsync();
    router.replace("/projects");
  };

  return (
    <div className="space-y-6">
      {/* Danger Zone */}
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            <CardTitle className="text-base text-destructive">
              Danger Zone
            </CardTitle>
          </div>
          <CardDescription>
            Destructive actions that cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "flex items-center justify-between p-4 rounded-lg",
              "border border-destructive/20 bg-destructive/5",
            )}
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                Delete this project
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Permanently delete this project and all associated data
                including events, crashes, and insights. This cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="shrink-0 ml-4 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the project and all its data —
                    events, crashes, insights and AI configuration. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90 text-white"
                  >
                    Delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SettingsPage() {
  const params = useParams();
  const projectId = params?.id as string;

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your project configuration
        </p>
      </div>

      <Tabs defaultValue="details">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="ai">AI Config</TabsTrigger>
          <TabsTrigger value="repository">Repository</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <div className="mt-6">
          <TabsContent value="details">
            <ProjectDetailsTab projectId={projectId} />
          </TabsContent>
          <TabsContent value="ai">
            <AIConfigTab projectId={projectId} />
          </TabsContent>
          <TabsContent value="repository">
            <RepositoryTab projectId={projectId} />
          </TabsContent>
          <TabsContent value="security">
            <SecurityTab projectId={projectId} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
