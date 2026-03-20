import { redirect } from "next/navigation";
export default function SettingsRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/${params.slug}/settings/general`);
}
