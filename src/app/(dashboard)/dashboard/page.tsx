"use client";

import {
  Activity,
  FolderKanban,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { StatsCard } from "@/components/dashboard/stats-card";
import { FRAMEWORK_LABELS, Framework } from "@/types";
import Link from "next/link";
import { useProjects } from "@/hooks";

export default function DashboardPage() {
  const { data: projects, isLoading } = useProjects();

  const totalEvents =
    projects?.reduce((acc, p) => acc + (p._count?.events ?? 0), 0) ?? 0;

  const activeProjects =
    projects?.filter((p) => (p._count?.events ?? 0) > 0).length ?? 0;

  const totalCrashes = 0; // placeholder until analytics are aggregated at dashboard level

  if (isLoading) {
    return (
      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of all your projects
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Total Projects"
          value={projects?.length ?? 0}
          icon={FolderKanban}
        />
        <StatsCard
          title="Total Events"
          value={totalEvents.toLocaleString()}
          icon={Activity}
        />
        <StatsCard
          title="Active Projects"
          value={activeProjects}
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Total Crashes"
          value={totalCrashes}
          icon={AlertTriangle}
          variant="error"
        />
      </div>

      {/* Projects */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">
            Your Projects
          </h2>
          <Link
            href="/projects"
            className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
          >
            View all
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {projects?.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-border rounded-lg">
            <FolderKanban className="w-10 h-10 text-muted-foreground/30 mb-3" />
            <p className="text-sm font-medium text-foreground">
              No projects yet
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Create your first project to start monitoring
            </p>
            <Link
              href="/projects"
              className="mt-4 text-sm text-brand hover:underline"
            >
              Go to Projects →
            </Link>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="group p-4 rounded-lg bg-card border border-border hover:border-brand/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <p className="font-medium text-foreground truncate">
                      {project.name}
                    </p>
                    {project.framework && (
                      <Badge
                        variant="outline"
                        className="text-brand border-brand/30 text-xs shrink-0"
                      >
                        {FRAMEWORK_LABELS[project.framework as Framework] ??
                          project.framework}
                      </Badge>
                    )}
                  </div>
                  {project.description && (
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>
                <div className="w-2 h-2 rounded-full bg-brand mt-1.5 shrink-0" />
              </div>

              <div className="flex items-center justify-between mt-3">
                <p className="text-xs text-muted-foreground font-mono">
                  {project._count?.events ?? 0} events
                </p>
                <ArrowRight className="w-3.5 h-3.5 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
