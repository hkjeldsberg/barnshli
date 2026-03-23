import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getChild, updateChild, deleteChild } from "@/lib/db/children";
import {
  validateDateNotFuture,
  validateTextLength,
} from "@/lib/utils/validation";

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

  const child = await getChild(id, user.id);
  if (!child) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(child);
}

export async function PUT(
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
    name?: unknown;
    date_of_birth?: unknown;
    sex?: unknown;
  };

  const updates: Record<string, unknown> = {};

  if (body.name !== undefined) {
    const v = validateTextLength(String(body.name), 1, 100);
    if (!v.valid) return NextResponse.json({ error: v.error }, { status: 400 });
    updates.name = String(body.name);
  }

  if (body.date_of_birth !== undefined) {
    const v = validateDateNotFuture(String(body.date_of_birth));
    if (!v.valid) return NextResponse.json({ error: v.error }, { status: 400 });
    updates.date_of_birth = String(body.date_of_birth);
  }

  if (body.sex !== undefined) {
    if (body.sex !== "male" && body.sex !== "female") {
      return NextResponse.json(
        { error: "Sex must be 'male' or 'female'." },
        { status: 400 },
      );
    }
    updates.sex = body.sex;
  }

  const child = await updateChild(id, user.id, updates);
  return NextResponse.json(child);
}

export async function DELETE(
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

  await deleteChild(id, user.id);
  return new NextResponse(null, { status: 204 });
}
