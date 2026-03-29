import { redirect } from "next/navigation";

export default function ProjectSettingsAIRedirect({
  params,
}: {
  params: { slug: string; productSlug: string; id: string };
}) {
  redirect(
    `/${params.slug}/products/${params.productSlug}/projects/${params.id}/settings?tab=ai`,
  );
}
