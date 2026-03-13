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
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import {
  useCancelInvitation,
  useCreateInvitation,
  useInvitations,
  useOrganisation,
  useRemoveMember,
  useUpdateMemberRole,
} from "@/hooks";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/auth.store";
import { MemberRole, OrgMember } from "@/types";
import { Clock, Crown, Mail, Shield, User, UserPlus, X } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";

// ─── Role config ──────────────────────────────────────────────────────────────

const ROLE_CONFIG: Record<
  MemberRole,
  {
    label: string;
    icon: React.ElementType;
    className: string;
  }
> = {
  owner: {
    label: "Owner",
    icon: Crown,
    className: "text-yellow-500 border-yellow-500/30 bg-yellow-500/10",
  },
  admin: {
    label: "Admin",
    icon: Shield,
    className: "text-brand border-brand/30 bg-brand/10",
  },
  member: {
    label: "Member",
    icon: User,
    className: "text-muted-foreground border-border",
  },
};

// ─── Member Row ───────────────────────────────────────────────────────────────

function MemberRow({
  member,
  slug,
  isCurrentUser,
  canManage,
}: {
  member: OrgMember;
  slug: string;
  isCurrentUser: boolean;
  canManage: boolean;
}) {
  const role = ROLE_CONFIG[member.role];
  const RoleIcon = role.icon;
  const updateRole = useUpdateMemberRole(slug);
  const removeMember = useRemoveMember(slug);

  return (
    <div className="flex items-center gap-4 py-3">
      <Avatar className="w-9 h-9 shrink-0">
        <AvatarFallback className="bg-accent text-accent-foreground text-xs">
          {member.user.name.slice(0, 2).toUpperCase()}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium text-foreground truncate">
            {member.user.name}
          </p>
          {isCurrentUser && (
            <span className="text-xs text-muted-foreground">(you)</span>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {member.user.email}
        </p>
      </div>

      <Badge
        variant="outline"
        className={cn("text-xs shrink-0", role.className)}
      >
        <RoleIcon className="w-3 h-3 mr-1" />
        {role.label}
      </Badge>

      {canManage && member.role !== "owner" && (
        <div className="flex items-center gap-2 shrink-0">
          <Select
            value={member.role}
            onValueChange={(value) =>
              updateRole.mutate({
                userId: member.userId,
                role: value as MemberRole,
              })
            }
          >
            <SelectTrigger className="h-8 w-28 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="member">Member</SelectItem>
            </SelectContent>
          </Select>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
              >
                <X className="w-4 h-4" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Remove member?</AlertDialogTitle>
                <AlertDialogDescription>
                  {member.user.name} will lose access to this organisation
                  immediately.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => removeMember.mutate(member.userId)}
                  className="bg-destructive hover:bg-destructive/90 text-white"
                >
                  Remove
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}
    </div>
  );
}

// ─── Invite Dialog ────────────────────────────────────────────────────────────

function InviteDialog({ slug }: { slug: string }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<"admin" | "member">("member");

  const createInvitation = useCreateInvitation(slug);

  const handleInvite = async () => {
    if (!email.trim()) return;
    await createInvitation.mutateAsync({ email: email.trim(), role });
    setEmail("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-brand hover:bg-brand/90 text-black font-semibold">
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent className="bg-card border-border">
        <DialogHeader>
          <DialogTitle className="text-foreground">Invite a member</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label>Email address</Label>
            <Input
              type="email"
              placeholder="colleague@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleInvite()}
              autoFocus
            />
          </div>
          <div className="space-y-2">
            <Label>Role</Label>
            <Select
              value={role}
              onValueChange={(v) => setRole(v as "admin" | "member")}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">
                  Admin — can manage members and projects
                </SelectItem>
                <SelectItem value="member">
                  Member — can view and use projects
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button
            onClick={handleInvite}
            disabled={!email.trim() || createInvitation.isPending}
            className="w-full bg-brand hover:bg-brand/90 text-black font-semibold"
          >
            {createInvitation.isPending ? "Sending..." : "Send Invitation"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MembersPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const user = useAuthStore((s) => s.user);

  const { data: org, isLoading: orgLoading } = useOrganisation(slug);
  const { data: invitations, isLoading: inviteLoading } = useInvitations(slug);
  const cancelInvitation = useCancelInvitation(slug);

  const isLoading = orgLoading || inviteLoading;

  const currentMember = org?.members.find((m) => m.userId === user?.id);
  const canManage =
    currentMember?.role === "owner" || currentMember?.role === "admin";

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-16" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Members</h1>
          <p className="text-muted-foreground mt-1">
            {org?.members.length ?? 0} member
            {org?.members.length !== 1 ? "s" : ""}
          </p>
        </div>
        {canManage && <InviteDialog slug={slug} />}
      </div>

      {/* Members */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Organisation Members</CardTitle>
          <CardDescription>
            People with access to this organisation.
          </CardDescription>
        </CardHeader>
        <CardContent className="divide-y divide-border">
          {org?.members.map((member) => (
            <MemberRow
              key={member.id}
              member={member}
              slug={slug}
              isCurrentUser={member.userId === user?.id}
              canManage={canManage}
            />
          ))}
        </CardContent>
      </Card>

      {/* Pending Invitations */}
      {canManage && (invitations?.length ?? 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Invitations</CardTitle>
            <CardDescription>
              Invitations that have been sent but not yet accepted.
            </CardDescription>
          </CardHeader>
          <CardContent className="divide-y divide-border">
            {invitations?.map((inv) => (
              <div key={inv.id} className="flex items-center gap-4 py-3">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                  <Mail className="w-4 h-4 text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">
                    {inv.email}
                  </p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Clock className="w-3 h-3 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Expires {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs shrink-0",
                    ROLE_CONFIG[inv.role].className,
                  )}
                >
                  {ROLE_CONFIG[inv.role].label}
                </Badge>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                  onClick={() => cancelInvitation.mutate(inv.token)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
