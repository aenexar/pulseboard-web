import { redirect } from "next/navigation";

export default function OrgSettingsDangerRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/${params.slug}/settings?tab=danger`);
}
