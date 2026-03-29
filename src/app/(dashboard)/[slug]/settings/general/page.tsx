import { redirect } from "next/navigation";

export default function OrgSettingsGeneralRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/${params.slug}/settings?tab=general`);
}
