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
import { useDeleteOrganisation } from "@/hooks";
import { cn } from "@/lib/utils";
import { Shield, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

export function DangerTab({ slug }: { slug: string }) {
  const router = useRouter();
  const deleteOrg = useDeleteOrganisation(slug);

  const handleDelete = async () => {
    await deleteOrg.mutateAsync();
    router.replace("/dashboard");
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
                Delete this organisation
              </p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Permanently deletes the organisation, all projects, events, and
                data. Cannot be undone.
              </p>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  className="shrink-0 ml-4 text-destructive hover:text-destructive hover:bg-destructive/10 border border-destructive/20"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Delete Organisation
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete organisation?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete the organisation and everything
                    in it — all projects, events, crashes, insights and members.
                    This cannot be undone.
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
