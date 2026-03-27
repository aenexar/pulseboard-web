"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useProduct, useUpdateProduct } from "@/hooks";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function ProductSettingsPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const productSlug = params?.productSlug as string;

  const { data: product, isLoading } = useProduct(slug, productSlug);
  const update = useUpdateProduct(slug, productSlug);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (product) {
      timeout = setTimeout(() => {
        setName(product.name);
        setDescription(product.description ?? "");
      }, 0);
    }

    return () => {
      if (timeout) {
        clearTimeout(timeout);
      }
    };
  }, [product]);

  const handleSave = async () => {
    await update.mutateAsync({
      name: name.trim(),
      description: description.trim(),
    });
    toast.success("Product updated");
  };

  if (isLoading) {
    return (
      <div className="space-y-4 max-w-lg">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10" />
        <Skeleton className="h-24" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-lg">
      {/* Header */}
      <div>
        <Link
          href={`/${slug}/products/${productSlug}`}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to {product?.name}
        </Link>
        <h1 className="text-2xl font-bold text-foreground">Product settings</h1>
        <p className="text-muted-foreground mt-1">
          Update your product details. These are used as context for AI
          insights.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        <div className="space-y-2">
          <Label htmlFor="name">Product name</Label>
          <Input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="My Product"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">
            Description
            <span className="ml-2 text-xs text-muted-foreground font-normal">
              Used as AI context — the more detail, the better the insights
            </span>
          </Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="A React Native app for iOS and Android that helps users track their fitness goals..."
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-muted-foreground">
            Describe what this product does, who uses it, and what matters most.
            AI insights will reference this when generating recommendations.
          </p>
        </div>

        <Button
          onClick={handleSave}
          disabled={!name.trim() || update.isPending}
          className="bg-brand hover:bg-brand/90 text-brand-foreground font-semibold"
        >
          {update.isPending ? "Saving..." : "Save changes"}
        </Button>
      </div>
    </div>
  );
}
