"use client";

import { AIConfigOrgForm } from "./ai-config-org-form";
import { DocumentUpload } from "./document-upload";

export function AIContextTab({ slug }: { slug: string }) {
  return (
    <div className="space-y-8">
      {/* Org-level AI config */}
      <AIConfigOrgForm slug={slug} />

      {/* Business context documents */}
      <DocumentUpload slug={slug} />
    </div>
  );
}
