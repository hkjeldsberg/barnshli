import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteWordEntry, updateWordEntry } from "@/lib/db/words";
import { validateTextLength, validateDateNotFuture } from "@/lib/utils/validation";

interface Params {
  params: Promise<{ id: string; wordId: string }>;
}

export async function PATCH(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  const { id, wordId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    base_word?: unknown;
    first_heard_at?: unknown;
    real_word?: unknown;
  };

  const updates: Record<string, string | null> = {};

  if (body.base_word !== undefined) {
    const val = validateTextLength(String(body.base_word ?? ""), 1, 200);
    if (!val.valid) return NextResponse.json({ error: val.error }, { status: 400 });
    updates.base_word = String(body.base_word);
  }

  if (body.first_heard_at !== undefined) {
    const val = validateDateNotFuture(String(body.first_heard_at ?? ""));
    if (!val.valid) return NextResponse.json({ error: val.error }, { status: 400 });
    updates.first_heard_at = String(body.first_heard_at);
  }

  if (body.real_word !== undefined) {
    const rw = body.real_word === "" ? null : String(body.real_word);
    if (rw !== null) {
      const val = validateTextLength(rw, 1, 200);
      if (!val.valid) return NextResponse.json({ error: val.error }, { status: 400 });
    }
    updates.real_word = rw;
  }

  const entry = await updateWordEntry(wordId, id, updates);
  return NextResponse.json(entry);
}

export async function DELETE(
  _request: Request,
  { params }: Params,
): Promise<NextResponse> {
  const { id, wordId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await deleteWordEntry(wordId, id);
  return new NextResponse(null, { status: 204 });
}
