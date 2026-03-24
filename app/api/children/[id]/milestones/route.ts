import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  listMilestones,
  createCustomMilestone,
  createUserChallenge,
} from "@/lib/db/milestones";
import { validateTextLength, validateDateNotFuture } from "@/lib/utils/validation";
import type { AgeBand } from "@/lib/utils/age";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const type = searchParams.get("type") as "custom" | "ai" | null;

  const milestones = await listMilestones(id, type ?? undefined);
  return NextResponse.json(milestones);
}

export async function POST(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    title?: unknown;
    achieved_at?: unknown;
    age_band?: unknown;
    type?: unknown;
  };

  const titleVal = validateTextLength(String(body.title ?? ""), 1, 500);
  if (!titleVal.valid) return NextResponse.json({ error: titleVal.error }, { status: 400 });

  // User challenge: no date required, uses age_band directly
  if (body.type === "challenge") {
    if (!body.age_band) {
      return NextResponse.json({ error: "age_band er påkrevd" }, { status: 400 });
    }
    const challenge = await createUserChallenge(id, {
      title: String(body.title),
      ageBand: String(body.age_band) as AgeBand,
    });
    return NextResponse.json(challenge, { status: 201 });
  }

  // Custom milestone: requires a date
  const dateVal = validateDateNotFuture(String(body.achieved_at ?? ""));
  if (!dateVal.valid) return NextResponse.json({ error: dateVal.error }, { status: 400 });

  if (!body.age_band) {
    return NextResponse.json({ error: "age_band is required" }, { status: 400 });
  }

  const milestone = await createCustomMilestone(id, {
    title: String(body.title),
    achieved_at: String(body.achieved_at),
    age_band: String(body.age_band) as Parameters<typeof createCustomMilestone>[1]["age_band"],
  });

  return NextResponse.json(milestone, { status: 201 });
}
