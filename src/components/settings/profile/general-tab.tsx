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
import { Skeleton } from "@/components/ui/skeleton";
import { LogoUpload } from "@/components/upload/logo-upload";
import {
  useConnections,
  useProfile,
  useRefreshProvider,
  useUpdateProfile,
  useUploadAvatarProfile,
} from "@/hooks";
import { useAuthStore } from "@/store/auth.store";
import { CheckCircle2, Save } from "lucide-react";
import { useEffect, useState } from "react";

export function GeneralTab() {
  const { data: profile, isLoading } = useProfile();
  const { data: connections } = useConnections();
  const updateProfile = useUpdateProfile();
  const uploadAvatar = useUploadAvatarProfile();
  const user = useAuthStore((s) => s.user);
  const refreshProvider = useRefreshProvider();

  const [name, setName] = useState("");
  const [saved, setSaved] = useState(false);

  const isOAuthOnly = !profile?.hasPassword && (connections?.length ?? 0) > 0;
  const connectedWith = connections?.[0]?.provider;

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (profile) {
      timeout = setTimeout(() => setName(profile.name), 0);
    }
    return () => clearTimeout(timeout);
  }, [profile]);

  // Refresh name/avatar from provider
  const handleRefresh = () => refreshProvider.mutate();

  const handleSave = async () => {
    if (!name.trim()) return;
    await updateProfile.mutateAsync(name.trim());
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Profile</CardTitle>
          <CardDescription>Your public profile information.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <LogoUpload
              currentUrl={user?.avatarUrl}
              fallback={user?.name ?? ""}
              onUpload={
                isOAuthOnly
                  ? undefined
                  : (file) => uploadAvatar.mutateAsync(file)
              }
              isUploading={uploadAvatar.isPending}
              size={80}
              shape="circle"
              disabled={isOAuthOnly}
            />
          </div>

          {/* OAuth notice */}
          {isOAuthOnly && (
            <div className="flex items-center justify-between p-3 rounded-lg bg-muted border border-border">
              <p className="text-sm text-muted-foreground">
                Profile synced from{" "}
                <span className="font-medium capitalize text-foreground">
                  {connectedWith}
                </span>
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleRefresh}
                disabled={refreshProvider.isPending}
              >
                {refreshProvider.isPending ? "Refreshing..." : "Refresh"}
              </Button>
            </div>
          )}

          {/* Name */}
          <div className="space-y-2">
            <Label>Full name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
              disabled={isOAuthOnly}
            />
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label>Email</Label>
            <Input
              value={profile?.email ?? ""}
              disabled
              className="text-muted-foreground"
            />
            {!isOAuthOnly && (
              <p className="text-xs text-muted-foreground">
                Change your email in the Security tab.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {!isOAuthOnly && (
        <div className="flex items-center gap-3">
          <Button
            onClick={handleSave}
            disabled={!name.trim() || updateProfile.isPending}
            className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
          >
            <Save className="w-4 h-4 mr-2" />
            {updateProfile.isPending ? "Saving..." : "Save Changes"}
          </Button>
          {saved && (
            <div className="flex items-center gap-1.5 text-sm text-brand">
              <CheckCircle2 className="w-4 h-4" />
              Saved
            </div>
          )}
        </div>
      )}
    </div>
  );
}
