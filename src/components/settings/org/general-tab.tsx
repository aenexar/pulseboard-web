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
import { useOrganisation, useUpdateOrganisation } from "@/hooks";
import { useUploadOrgLogo } from "@/hooks/uploads/useUploadOrgLogo";
import { AlertTriangle, Building2, CheckCircle2, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export function GeneralTab({ slug }: { slug: string }) {
  const router = useRouter();
  const { data: org, isLoading } = useOrganisation(slug);
  const updateOrg = useUpdateOrganisation(slug);
  const uploadLogo = useUploadOrgLogo(slug);

  const [name, setName] = useState("");
  const [orgSlug, setOrgSlug] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!org) return;
    const t = setTimeout(() => {
      setName(org.name);
      setOrgSlug(org.slug);
    }, 0);
    return () => clearTimeout(t);
  }, [org]);

  const handleSave = async () => {
    const updated = await updateOrg.mutateAsync({
      name: name.trim(),
      slug: orgSlug.trim(),
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

    // Redirect if slug changed
    if (updated.slug !== slug) {
      router.replace(`/${updated.slug}/settings`);
    }
  };

  if (isLoading) return <Skeleton className="h-64" />;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">Organisation Details</CardTitle>
          </div>
          <CardDescription>
            Update your organisation name and URL slug.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Logo */}
          <div className="flex flex-col items-center pb-2">
            <LogoUpload
              currentUrl={org?.logoUrl}
              fallback={org?.name ?? slug}
              onUpload={(file) => uploadLogo.mutateAsync(file)}
              isUploading={uploadLogo.isPending}
              size={80}
              shape="rounded"
            />
          </div>
          <div className="space-y-2">
            <Label>Organisation Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Organisation"
            />
          </div>
          <div className="space-y-2">
            <Label>URL Slug</Label>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground shrink-0">
                pulseboard.app/
              </span>
              <Input
                value={orgSlug}
                onChange={(e) =>
                  setOrgSlug(
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""),
                  )
                }
                placeholder="my-org"
                className="font-mono"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Changing the slug will update all URLs — existing links will
              break.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center gap-3">
        <Button
          onClick={handleSave}
          disabled={!name.trim() || !orgSlug.trim() || updateOrg.isPending}
          className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateOrg.isPending ? "Saving..." : "Save Changes"}
        </Button>
        {saved && (
          <div className="flex items-center gap-1.5 text-sm text-brand">
            <CheckCircle2 className="w-4 h-4" />
            Saved
          </div>
        )}
        {updateOrg.isError && (
          <div className="flex items-center gap-1.5 text-sm text-destructive">
            <AlertTriangle className="w-4 h-4" />
            Failed to save
          </div>
        )}
      </div>
    </div>
  );
}
