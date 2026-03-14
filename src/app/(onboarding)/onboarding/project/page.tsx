"use client";

import { Button } from "@/components/ui/button";
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
import { useCreateProject } from "@/hooks";
import { useOrganisations } from "@/hooks/organisations/useOrganisations";
import { useOnboardingStore } from "@/store/onboarding.store";
import { cn } from "@/lib/utils";
import { Framework, FRAMEWORK_GROUPS, FRAMEWORK_LABELS } from "@/types";
import { AlertTriangle, ChevronRight, FolderKanban } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function OnboardingProjectPage() {
  const router = useRouter();
  const setProject = useOnboardingStore((s) => s.setProject);

  const { data: orgs } = useOrganisations();
  const personalOrg = orgs?.[0];

  const createProject = useCreateProject(personalOrg?.slug ?? "");

  const [name, setName] = useState("");
  const [framework, setFramework] = useState<Framework | "">("");

  const handleCreate = async () => {
    if (!name.trim() || !personalOrg) return;

    const project = await createProject.mutateAsync(name.trim());

    setProject(
      personalOrg.slug,
      project.id,
      project.apiKey,
      (framework || "react-native-cli") as Framework,
    );

    router.push("/onboarding/sdk");
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
              <FolderKanban className="w-7 h-7 text-brand" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-foreground">
            Create your first project
          </h1>
          <p className="text-sm text-muted-foreground">
            A project represents one of your apps. You can add more later.
          </p>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label>Project name</Label>
            <Input
              placeholder="My Mobile App"
              value={name}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
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
              Used to tailor SDK instructions and AI recommendations.
            </p>
          </div>

          {createProject.isError && (
            <div className="flex items-center gap-2.5 p-3 rounded-lg bg-destructive/10 border border-destructive/20">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <p className="text-sm text-destructive">
                Failed to create project. Please try again.
              </p>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Step 2 of 4</span>
            <span>50%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="h-full w-1/2 bg-brand rounded-full transition-all duration-500" />
          </div>
        </div>

        <Button
          onClick={handleCreate}
          disabled={!name.trim() || createProject.isPending}
          className="w-full bg-brand hover:bg-brand/90 text-brand-foreground font-semibold h-11"
        >
          {createProject.isPending ? "Creating..." : "Create project"}
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
