import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listWordEntries, createWordEntry } from "@/lib/db/words";
import { validateTextLength, validateDateNotFuture } from "@/lib/utils/validation";

interface Params {
  params: Promise<{ id: string }>;
}

export async function GET(
  _request: Request,
  { params }: Params,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const entries = await listWordEntries(id);
  return NextResponse.json(entries);
}

export async function POST(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { base_word?: unknown; first_heard_at?: unknown };

  const wordVal = validateTextLength(String(body.base_word ?? ""), 1, 200);
  if (!wordVal.valid) return NextResponse.json({ error: wordVal.error }, { status: 400 });

  const dateVal = validateDateNotFuture(String(body.first_heard_at ?? ""));
  if (!dateVal.valid) return NextResponse.json({ error: dateVal.error }, { status: 400 });

  const entry = await createWordEntry(id, {
    base_word: String(body.base_word),
    first_heard_at: String(body.first_heard_at),
  });

  return NextResponse.json(entry, { status: 201 });
}
