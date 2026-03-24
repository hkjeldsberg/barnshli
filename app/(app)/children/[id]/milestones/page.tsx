import { redirect } from "next/navigation";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function MilestonesIndexPage({
  params,
}: Props): Promise<never> {
  const { id } = await params;
  redirect(`/children/${id}/milestones/ai`);
}
