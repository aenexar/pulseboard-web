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
import { useGitHubRepos, useProject, useUpdateRepository } from "@/hooks";
import { cn } from "@/lib/utils";
import { REPOSITORY_PROVIDER_LABELS, RepositoryProvider } from "@/types";
import {
  AlertTriangle,
  CheckCircle2,
  FolderGit2,
  GitBranch,
  Save,
} from "lucide-react";
import { useEffect, useState } from "react";

// ─── Repository Tab ───────────────────────────────────────────────────────────

export function RepositoryTab({
  slug,
  productSlug,
  projectId,
}: {
  slug: string;
  productSlug: string;
  projectId: string;
}) {
  const { data: project, isLoading } = useProject(slug, productSlug, projectId);
  const { data: repos, isLoading: reposLoading } = useGitHubRepos(slug);
  const updateRepository = useUpdateRepository(slug, productSlug, projectId);

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

  const hasGitHubInstallation = (repos?.length ?? 0) > 0;
  const isGitHub = provider === "github";
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
            Connect your source repository to enable code-level crash analysis.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
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

          {/* GitHub App install banner */}
          {isGitHub && !hasGitHubInstallation && (
            <div
              className={cn(
                "flex items-start justify-between gap-4 p-4 rounded-lg",
                "bg-muted border border-border",
              )}
            >
              <div className="flex items-start gap-3">
                <FolderGit2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    GitHub App not installed
                  </p>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Install the PulseBoard GitHub App to browse and connect your
                    repositories.
                  </p>
                </div>
              </div>
              <a
                href={`${process.env.NEXT_PUBLIC_API_URL}/github/install/${slug}`}
                className="shrink-0"
              >
                <Button
                  size="sm"
                  className="bg-brand hover:bg-brand/90 text-black font-semibold"
                >
                  Install App
                </Button>
              </a>
            </div>
          )}

          {/* GitHub repo browser */}
          {isGitHub && hasGitHubInstallation && (
            <div className="space-y-2">
              <Label>Repository</Label>
              <Select
                value={url}
                onValueChange={(v) => {
                  const repo = repos?.find((r) => r.url === v);
                  setUrl(v);
                  if (repo) setBranch(repo.defaultBranch);
                }}
              >
                <SelectTrigger>
                  <SelectValue
                    placeholder={
                      reposLoading ? "Loading repos..." : "Select a repository"
                    }
                  />
                </SelectTrigger>
                <SelectContent>
                  {repos?.map((repo) => (
                    <SelectItem key={repo.id} value={repo.url}>
                      {repo.fullName}
                      {repo.private && (
                        <span className="ml-2 text-xs text-muted-foreground">
                          Private
                        </span>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Manual URL input for non-GitHub providers */}
          {!isGitHub && (
            <div className="space-y-2">
              <Label>Repository URL</Label>
              <Input
                placeholder="https://gitlab.com/yourorg/your-repo"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="font-mono text-sm"
              />
            </div>
          )}

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

          {!project?.repository && !url && (
            <div
              className={cn(
                "flex items-start gap-3 p-4 rounded-lg bg-muted border border-border",
              )}
            >
              <FolderGit2 className="w-5 h-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-foreground">
                  No repository connected
                </p>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Connecting your repository will allow AI insights to reference
                  specific files and line numbers.
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
