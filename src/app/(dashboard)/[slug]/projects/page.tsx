"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { useCreateProject, useProjects } from "@/hooks";
import { Framework, FRAMEWORK_LABELS } from "@/types";
import { ArrowRight, FolderKanban, Plus } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

export default function ProjectsPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const { data: projects, isLoading } = useProjects(slug);
  const createProject = useCreateProject(slug);
  const [name, setName] = useState("");
  const [open, setOpen] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    await createProject.mutateAsync(name.trim());
    setName("");
    setOpen(false);
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Projects</h1>
          <p className="text-muted-foreground mt-1">
            {projects?.length ?? 0} project{projects?.length !== 1 ? "s" : ""}
          </p>
        </div>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button className="bg-brand hover:bg-brand/90 text-black font-semibold">
              <Plus className="w-4 h-4 mr-2" />
              New Project
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-card border-border">
            <DialogHeader>
              <DialogTitle className="text-foreground">
                Create a new project
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-2">
              <Input
                placeholder="My Mobile App"
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                className="bg-accent border-border"
                autoFocus
              />
              <Button
                onClick={handleCreate}
                disabled={!name.trim() || createProject.isPending}
                className="w-full bg-brand hover:bg-brand/90 text-black font-semibold"
              >
                {createProject.isPending ? "Creating..." : "Create Project"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Empty state */}
      {projects?.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <FolderKanban className="w-12 h-12 text-muted-foreground/30 mb-4" />
          <p className="text-muted-foreground font-medium">No projects yet</p>
          <p className="text-muted-foreground text-sm mt-1">
            Create your first project to start ingesting events
          </p>
        </div>
      )}

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {projects?.map((project) => (
          <Card key={project.id} className="bg-card border-border">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-brand" />
                <CardTitle className="text-foreground text-base">
                  {project.name}
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {project.description && (
                <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2">
                  {project.description}
                </p>
              )}
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className="text-muted-foreground border-border font-mono text-xs"
                >
                  {project._count?.events ?? 0} events
                </Badge>
                {project.framework && (
                  <Badge
                    variant="outline"
                    className="text-brand border-brand/30 text-xs"
                  >
                    {FRAMEWORK_LABELS[project.framework as Framework] ??
                      project.framework}
                  </Badge>
                )}
              </div>
              <code className="block text-xs font-mono text-muted-foreground truncate">
                {project.apiKey}
              </code>
              <Link href={`/${slug}/projects/${project.id}`}>
                <Button variant="outline" className="w-full mt-2">
                  View Project
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
