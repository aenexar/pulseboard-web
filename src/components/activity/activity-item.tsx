import { ActivityLog, UserActivityLog } from "@/types";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import {
  Brain,
  Building2,
  FolderKanban,
  GitBranch,
  LogIn,
  LogOut,
  Mail,
  Shield,
  Sparkles,
  Trash2,
  UserCheck,
  UserMinus,
  UserPlus,
  Key,
  Camera,
  Lock,
} from "lucide-react";
import Image from "next/image";
import { formatDistanceToNow } from "date-fns";

// ─── Action config ────────────────────────────────────────────────────────────

type ActionConfig = {
  icon: React.ElementType;
  color: string;
  bg: string;
  label: (item: ActivityLog | UserActivityLog) => string;
};

const ORG_ACTION_CONFIG: Record<string, ActionConfig> = {
  "project.created": {
    icon: FolderKanban,
    color: "text-brand",
    bg: "bg-brand/10",
    label: (i) =>
      `created project ${"targetName" in i && i.targetName ? `"${i.targetName}"` : ""}`,
  },
  "project.deleted": {
    icon: Trash2,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: () => "deleted a project",
  },
  "member.joined": {
    icon: UserPlus,
    color: "text-brand",
    bg: "bg-brand/10",
    label: () => `joined the organisation`,
  },
  "member.removed": {
    icon: UserMinus,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: (i) =>
      `removed ${"targetName" in i && i.targetName ? i.targetName : "a member"}`,
  },
  "member.role_changed": {
    icon: Shield,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    label: (i) => {
      const meta = "metadata" in i ? i.metadata : null;
      return `changed ${"targetName" in i && i.targetName ? i.targetName + "'s" : "a member's"} role to ${meta?.newRole ?? ""}`;
    },
  },
  "invitation.sent": {
    icon: Mail,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: (i) =>
      `invited ${"targetName" in i && i.targetName ? i.targetName : "someone"}`,
  },
  "invitation.cancelled": {
    icon: Mail,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: (i) =>
      `cancelled invitation for ${"targetName" in i && i.targetName ? i.targetName : "someone"}`,
  },
  "org.updated": {
    icon: Building2,
    color: "text-brand",
    bg: "bg-brand/10",
    label: () => "updated organisation settings",
  },
  "org.logo_updated": {
    icon: Camera,
    color: "text-brand",
    bg: "bg-brand/10",
    label: () => "updated the organisation logo",
  },
  "org.plan_changed": {
    icon: Sparkles,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    label: (i) => {
      const meta = "metadata" in i ? i.metadata : null;
      return `upgraded plan to ${meta?.newPlan ?? "Pro"}`;
    },
  },
  "ai_config.added": {
    icon: Brain,
    color: "text-brand",
    bg: "bg-brand/10",
    label: (i) =>
      `configured AI insights for ${"targetName" in i && i.targetName ? `"${i.targetName}"` : "a project"}`,
  },
  "ai_config.removed": {
    icon: Brain,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: () => "removed AI configuration",
  },
  "insights.triggered": {
    icon: Sparkles,
    color: "text-brand",
    bg: "bg-brand/10",
    label: (i) =>
      `triggered AI insights for ${"targetName" in i && i.targetName ? `"${i.targetName}"` : "a project"}`,
  },
  "repository.connected": {
    icon: GitBranch,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: (i) =>
      `connected repository to ${"targetName" in i && i.targetName ? `"${i.targetName}"` : "a project"}`,
  },
};

const USER_ACTION_CONFIG: Record<string, ActionConfig> = {
  "auth.login": {
    icon: LogIn,
    color: "text-brand",
    bg: "bg-brand/10",
    label: () => "signed in",
  },
  "auth.logout": {
    icon: LogOut,
    color: "text-muted-foreground",
    bg: "bg-muted",
    label: () => "signed out",
  },
  "profile.name_updated": {
    icon: UserCheck,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: () => "updated their name",
  },
  "profile.email_changed": {
    icon: Mail,
    color: "text-blue-500",
    bg: "bg-blue-500/10",
    label: () => "changed their email address",
  },
  "profile.password_changed": {
    icon: Lock,
    color: "text-yellow-500",
    bg: "bg-yellow-500/10",
    label: () => "changed their password",
  },
  "profile.avatar_updated": {
    icon: Camera,
    color: "text-brand",
    bg: "bg-brand/10",
    label: () => "updated their profile picture",
  },
  "session.revoked": {
    icon: Key,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: () => "signed out a device",
  },
  "session.revoked_all": {
    icon: Key,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: () => "signed out all other devices",
  },
  "org.invitation_accepted": {
    icon: UserPlus,
    color: "text-brand",
    bg: "bg-brand/10",
    label: (i) => {
      const meta = "metadata" in i ? i.metadata : null;
      return `joined ${meta?.orgName ?? "an organisation"}`;
    },
  },
  "org.removed": {
    icon: UserMinus,
    color: "text-destructive",
    bg: "bg-destructive/10",
    label: (i) => {
      const meta = "metadata" in i ? i.metadata : null;
      return `was removed from ${meta?.orgName ?? "an organisation"}`;
    },
  },
};

// ─── Org Activity Item ────────────────────────────────────────────────────────

export function OrgActivityItem({ item }: { item: ActivityLog }) {
  const config = ORG_ACTION_CONFIG[item.action];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-3">
      {/* Actor avatar */}
      <div className="relative shrink-0">
        <Avatar className="w-8 h-8">
          {item.actorAvatar ? (
            <Image
              src={item.actorAvatar}
              alt={item.actorName ?? ""}
              fill
              className="object-cover rounded-full"
            />
          ) : (
            <AvatarFallback className="bg-accent text-accent-foreground text-xs">
              {(item.actorName ?? "?").slice(0, 2).toUpperCase()}
            </AvatarFallback>
          )}
        </Avatar>
        {/* Action icon badge */}
        <div
          className={cn(
            "absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center",
            config.bg,
          )}
        >
          <Icon className={cn("w-2.5 h-2.5", config.color)} />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground leading-snug">
          <span className="font-semibold">{item.actorName ?? "System"}</span>{" "}
          <span className="text-muted-foreground">{config.label(item)}</span>
        </p>
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}

// ─── User Activity Item ───────────────────────────────────────────────────────

export function UserActivityItem({ item }: { item: UserActivityLog }) {
  const config = USER_ACTION_CONFIG[item.action];
  if (!config) return null;

  const Icon = config.icon;

  return (
    <div className="flex items-start gap-3 py-3">
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0",
          config.bg,
        )}
      >
        <Icon className={cn("w-4 h-4", config.color)} />
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground">{config.label(item)}</p>
        {item.metadata && "device" in item.metadata && (
          <p className="text-xs text-muted-foreground mt-0.5">
            {[
              item.metadata.browser,
              item.metadata.os,
              item.metadata.city,
              item.metadata.country,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        )}
        <p className="text-xs text-muted-foreground mt-0.5">
          {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
        </p>
      </div>
    </div>
  );
}
