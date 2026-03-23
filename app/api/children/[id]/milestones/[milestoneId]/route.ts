import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toggleMilestone, deleteMilestone } from "@/lib/db/milestones";

interface Params {
  params: Promise<{ id: string; milestoneId: string }>;
}

export async function PATCH(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  const { id, milestoneId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { completed?: unknown };
  if (typeof body.completed !== "boolean") {
    return NextResponse.json({ error: "completed must be a boolean" }, { status: 400 });
  }

  const milestone = await toggleMilestone(milestoneId, id, body.completed);
  return NextResponse.json(milestone);
}

export async function DELETE(
  _request: Request,
  { params }: Params,
): Promise<NextResponse> {
  const { id, milestoneId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteMilestone(milestoneId, id);
  return new NextResponse(null, { status: 204 });
}
