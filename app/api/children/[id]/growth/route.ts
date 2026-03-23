import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listGrowthRecords, createGrowthRecord } from "@/lib/db/growth";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: Params,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const records = await listGrowthRecords(id);
  return NextResponse.json(records);
}

export async function POST(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    recorded_at?: unknown;
    weight_kg?: unknown;
    height_cm?: unknown;
  };

  try {
    const record = await createGrowthRecord(id, user.id, {
      recorded_at: String(body.recorded_at ?? ""),
      weight_kg: body.weight_kg != null ? Number(body.weight_kg) : null,
      height_cm: body.height_cm != null ? Number(body.height_cm) : null,
    });
    return NextResponse.json(record, { status: 201 });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
