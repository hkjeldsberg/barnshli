import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { toggleMilestone, deleteMilestone, updateMilestone } from "@/lib/db/milestones";

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

  const body = (await request.json()) as {
    completed?: unknown;
    title?: unknown;
    achieved_at?: unknown;
    age_band?: unknown;
  };

  // Toggle completion (AIChecklist)
  if (typeof body.completed === "boolean") {
    const milestone = await toggleMilestone(milestoneId, id, body.completed);
    return NextResponse.json(milestone);
  }

  // Edit title / date (MilestoneTimeline)
  const updates: { title?: string; achieved_at?: string; age_band?: string } = {};
  if (typeof body.title === "string" && body.title.trim()) {
    updates.title = body.title.trim();
  }
  if (typeof body.achieved_at === "string") {
    updates.achieved_at = body.achieved_at;
  }
  if (typeof body.age_band === "string") {
    updates.age_band = body.age_band;
  }

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No valid fields to update" }, { status: 400 });
  }

  const milestone = await updateMilestone(milestoneId, id, updates);
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
