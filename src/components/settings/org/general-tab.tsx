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
import { Textarea } from "@/components/ui/textarea";
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
  const [description, setDescription] = useState("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!org) return;
    const t = setTimeout(() => {
      setName(org.name);
      setOrgSlug(org.slug);
      setDescription(org.description ?? "");
    }, 0);
    return () => clearTimeout(t);
  }, [org]);

  const handleSave = async () => {
    const updated = await updateOrg.mutateAsync({
      name: name.trim(),
      slug: orgSlug.trim(),
      description: description.trim() || undefined,
    });

    setSaved(true);
    setTimeout(() => setSaved(false), 3000);

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
            Update your organisation name, URL slug, and description.
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

          {/* Name */}
          <div className="space-y-2">
            <Label>Organisation Name</Label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Organisation"
            />
          </div>

          {/* Slug */}
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

          {/* Description */}
          <div className="space-y-2">
            <Label>
              Description
              <span className="ml-2 text-xs text-muted-foreground font-normal">
                Used as context for AI insight generation
              </span>
            </Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe what your organisation does, your goals, and what matters most. AI will use this when generating insights across all products and projects."
              rows={4}
              className="resize-none"
            />
            <p className="text-xs text-muted-foreground">
              The more detail you provide, the more relevant and accurate AI
              insights will be.
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
