"use client";

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
import { useCreateOrganisation } from "@/hooks";
import { cn } from "@/lib/utils";
import { AlertTriangle, Building2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function NewOrganisationPage() {
  const router = useRouter();
  const createOrg = useCreateOrganisation();

  const [name, setName] = useState("");
  const [error, setError] = useState("");

  const handleCreate = async () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setError("");

    try {
      const org = await createOrg.mutateAsync({ name: trimmed });
      router.replace(`/${org.slug}`);
    } catch (err: unknown) {
      const msg =
        err?.response?.data?.message ?? "Failed to create organisation.";
      setError(msg);
    }
  };

  return (
    <div className="space-y-8 max-w-lg">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">New Organisation</h1>
        <p className="text-muted-foreground mt-1">
          Create a workspace to collaborate with your team.
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-muted-foreground" />
            <CardTitle className="text-base">Organisation Details</CardTitle>
          </div>
          <CardDescription>
            You can invite members and configure settings after creation.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Organisation Name</Label>
            <Input
              placeholder="Acme Corp"
              value={name}
              onChange={(e) => {
                setName(e.target.value);
                setError("");
              }}
              onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              autoFocus
            />
          </div>

          {error && (
            <div
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg",
                "bg-destructive/10 border border-destructive/20",
              )}
            >
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
              <p className="text-sm text-destructive">{error}</p>
            </div>
          )}

          <div className="flex items-center gap-3">
            <Button
              onClick={handleCreate}
              disabled={!name.trim() || createOrg.isPending}
              className="bg-brand hover:bg-brand/90 text-black font-semibold"
            >
              {createOrg.isPending ? "Creating..." : "Create Organisation"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => router.back()}
              className="text-muted-foreground"
            >
              Cancel
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
