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
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDeleteProject } from "@/hooks";
import { cn } from "@/lib/utils";
import { Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

// ─── Security Tab ─────────────────────────────────────────────────────────────

export function SecurityTab({
  slug,
  productSlug,
  projectId,
}: {
  slug: string;
  productSlug: string;
  projectId: string;
}) {
  const router = useRouter();
  const deleteProject = useDeleteProject(slug, productSlug, projectId);

  const handleDelete = async () => {
    await deleteProject.mutateAsync();
    router.replace(`/${slug}/projects`);
  };

  return (
    <div className="space-y-6">
      <Card className="border-destructive/30">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-destructive" />
            <CardTitle className="text-base text-destructive">
              Danger Zone
            </CardTitle>
          </div>
          <CardDescription>
            Destructive actions that cannot be undone.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            className={cn(
              "flex items-center justify-between p-4 rounded-lg",
              "border border-destructive/20 bg-destructive/5",
            )}
          >
            <div>
              <p className="text-sm font-medium text-foreground">
                Delete this project
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Permanently delete this project and all associated data. This
                cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="shrink-0 ml-4 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Project
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete project?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the project and all its data —
                    events, crashes, insights and AI configuration. This action
                    cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    className="bg-destructive hover:bg-destructive/90 text-white"
                  >
                    Delete permanently
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
