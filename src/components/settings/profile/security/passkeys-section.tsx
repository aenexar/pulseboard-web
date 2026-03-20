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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useDeletePasskey, usePasskeys, useRegisterPasskey } from "@/hooks";
import axios from "axios";
import { formatDistanceToNow } from "date-fns";
import { AlertTriangle, Key, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

export function PasskeysSection() {
  const { data: passkeys, isLoading } = usePasskeys();
  const registerPasskey = useRegisterPasskey();
  const deletePasskey = useDeletePasskey();

  const [name, setName] = useState("");
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async () => {
    if (!name.trim()) return;
    setError(null);
    try {
      await registerPasskey.mutateAsync(name.trim());
      setName("");
      setAdding(false);
    } catch (err: unknown) {
      const message = axios.isAxiosError(err)
        ? (err.response?.data?.message ??
          "Registration failed. Please try again.")
        : "Registration failed. Please try again.";
      setError(message);
    }
  };

  if (isLoading) return <Skeleton className="h-32" />;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Key className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">Passkeys</CardTitle>
          </div>
          {!adding && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setAdding(true);
                setError(null);
              }}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add passkey
            </Button>
          )}
        </div>
        <CardDescription>
          Sign in securely using biometrics or your device PIN — no password
          needed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Add passkey form */}
        {adding && (
          <div className="space-y-3 p-4 rounded-lg border border-border bg-muted/30">
            <div className="space-y-2">
              <Label>Passkey name</Label>
              <Input
                placeholder="e.g. MacBook Touch ID"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoFocus
              />
              <p className="text-xs text-muted-foreground">
                Give it a name to identify this device later.
              </p>
            </div>
            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setAdding(false);
                  setName("");
                  setError(null);
                }}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
                onClick={handleRegister}
                disabled={!name.trim() || registerPasskey.isPending}
              >
                {registerPasskey.isPending
                  ? "Registering..."
                  : "Register passkey"}
              </Button>
            </div>
          </div>
        )}

        {/* Passkey list */}
        {passkeys?.length === 0 && !adding && (
          <p className="text-sm text-muted-foreground text-center py-4">
            No passkeys registered yet.
          </p>
        )}

        {passkeys?.map((passkey) => (
          <div
            key={passkey.id}
            className="flex items-center justify-between p-3 rounded-lg border border-border bg-card"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center">
                <Key className="w-4 h-4 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium text-foreground">
                  {passkey.name}
                </p>
                <p className="text-xs text-muted-foreground">
                  {passkey.lastUsedAt
                    ? `Last used ${formatDistanceToNow(new Date(passkey.lastUsedAt), { addSuffix: true })}`
                    : `Added ${formatDistanceToNow(new Date(passkey.createdAt), { addSuffix: true })}`}
                  {passkey.backedUp && " · Synced"}
                </p>
              </div>
            </div>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove passkey?</AlertDialogTitle>
                  <AlertDialogDescription>
                    &quot;{passkey.name}&quot; will be removed. You won&apos;t
                    be able to sign in with this passkey anymore.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deletePasskey.mutate(passkey.id)}
                    className="bg-destructive hover:bg-destructive/90 text-white"
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
