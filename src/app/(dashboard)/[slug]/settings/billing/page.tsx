import { redirect } from "next/navigation";

export default function OrgSettingsBillingRedirect({
  params,
}: {
  params: { slug: string };
}) {
  redirect(`/${params.slug}/settings?tab=billing`);
}
