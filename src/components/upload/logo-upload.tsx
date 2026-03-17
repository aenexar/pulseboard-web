"use client";

import { cn } from "@/lib/utils";
import { Camera, Loader2, X } from "lucide-react";
import Image from "next/image";
import { useRef, useState } from "react";
interface LogoUploadProps {
  currentUrl: string | null | undefined;
  fallback: string;
  onUpload: ((file: File) => Promise<string>) | undefined;
  isUploading: boolean;
  size?: number;
  shape?: "circle" | "rounded";
  disabled?: boolean;
}

export function LogoUpload({
  currentUrl,
  fallback,
  onUpload,
  isUploading,
  size = 80,
  shape = "rounded",
  disabled = false,
}: LogoUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const displayUrl = preview ?? currentUrl;
  const isDisabled = isUploading || disabled;

  const handleChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || disabled) return;

    setError(null);

    if (file.size > 2 * 1024 * 1024) {
      setError("File must be under 2MB");
      return;
    }

    if (
      !["image/jpeg", "image/png", "image/webp", "image/gif"].includes(
        file.type,
      )
    ) {
      setError("Only JPEG, PNG, WebP and GIF allowed");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(file);

    try {
      await onUpload?.(file);
    } catch {
      setPreview(null);
      setError("Upload failed. Please try again.");
    }
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <button
        type="button"
        onClick={() => !isDisabled && inputRef.current?.click()}
        disabled={isDisabled}
        className={cn(
          "relative group overflow-hidden border-2 border-dashed border-border",
          "transition-colors",
          !isDisabled && "hover:border-brand/50",
          shape === "circle" && "rounded-full",
          shape === "rounded" && "rounded-2xl",
          isDisabled && "cursor-not-allowed opacity-70",
        )}
        style={{ width: size, height: size }}
      >
        {displayUrl ? (
          <Image src={displayUrl} alt="Logo" fill className="object-cover" />
        ) : (
          <div
            className={cn(
              "w-full h-full flex items-center justify-center",
              "bg-muted text-muted-foreground text-lg font-bold",
            )}
          >
            {fallback.slice(0, 2).toUpperCase()}
          </div>
        )}

        {/* Overlay — only show on hover if not disabled */}
        {!disabled && (
          <div
            className={cn(
              "absolute inset-0 flex items-center justify-center",
              "bg-black/50 transition-opacity",
              isUploading ? "opacity-100" : "opacity-0 group-hover:opacity-100",
            )}
          >
            {isUploading ? (
              <Loader2 className="w-5 h-5 text-white animate-spin" />
            ) : (
              <Camera className="w-5 h-5 text-white" />
            )}
          </div>
        )}
      </button>

      <input
        aria-label="image-picker"
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={handleChange}
        disabled={isDisabled}
      />

      {error && (
        <div className="flex items-center gap-1.5 text-xs text-destructive">
          <X className="w-3 h-3" />
          {error}
        </div>
      )}

      {!disabled && (
        <p className="text-xs text-muted-foreground text-center">
          Click to upload · JPEG, PNG, WebP, GIF · Max 2MB
        </p>
      )}
    </div>
  );
}
