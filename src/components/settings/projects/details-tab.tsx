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
import { Textarea } from "@/components/ui/textarea";
import { useProject, useUpdateProject } from "@/hooks";
import { Framework, FRAMEWORK_GROUPS, FRAMEWORK_LABELS } from "@/types";
import { AlertTriangle, CheckCircle2, Save, Settings2 } from "lucide-react";
import { useEffect, useState } from "react";

export function ProjectDetailsTab({
  slug,
  productSlug,
  projectId,
}: {
  slug: string;
  productSlug: string;
  projectId: string;
}) {
  const { data: project, isLoading } = useProject(slug, productSlug, projectId);
  const updateProject = useUpdateProject(slug, productSlug, projectId);

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
          <div className="space-y-2">
            <Label>Project Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Mobile App"
            />
          </div>
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
