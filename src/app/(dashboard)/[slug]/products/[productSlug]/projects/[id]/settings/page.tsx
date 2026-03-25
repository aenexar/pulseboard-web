import { redirect } from "next/navigation";

export default function ProjectSettingsRedirect({
  params,
}: {
  params: { slug: string; id: string };
}) {
  redirect(`/${params.slug}/projects/${params.id}/settings/details`);
}
