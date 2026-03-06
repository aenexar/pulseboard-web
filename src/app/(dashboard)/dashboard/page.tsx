"use client";

import {
  Activity,
  FolderKanban,
  AlertTriangle,
  CheckCircle,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { StatsCard } from "@/components/dashboard/stats-card";
import Link from "next/link";
import { useProjects } from "@/hooks";

export default function DashboardPage() {
  const { data: projects, isLoading } = useProjects();

  const totalEvents =
    projects?.reduce((acc, p) => acc + (p._count?.events ?? 0), 0) ?? 0;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Skeleton key={i} className="h-32 bg-accent" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Overview of all your projects
        </p>
      </div>

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
          value={
            projects?.filter((p) => (p._count?.events ?? 0) > 0).length ?? 0
          }
          icon={CheckCircle}
          variant="success"
        />
        <StatsCard
          title="Projects"
          value={projects?.length ?? 0}
          icon={AlertTriangle}
          variant="error"
        />
      </div>

      <div>
        <h2 className="text-lg font-semibold text-foreground mb-4">
          Your Projects
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects?.map((project) => (
            <Link
              key={project.id}
              href={`/projects/${project.id}`}
              className="p-4 rounded-lg bg-card border border-border hover:border-border transition-colors"
            >
              <div className="flex items-start justify-between">
                <div>
                  <p className="font-medium text-foreground">{project.name}</p>
                  <p className="text-xs text-muted-foreground font-mono mt-1">
                    {project._count?.events ?? 0} events
                  </p>
                </div>
                <div className="w-2 h-2 rounded-full bg-brand mt-1" />
              </div>
              <p className="text-xs text-muted-foreground font-mono mt-3 truncate">
                {project.apiKey}
              </p>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
