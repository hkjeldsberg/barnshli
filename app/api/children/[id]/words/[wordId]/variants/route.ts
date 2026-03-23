import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { addWordVariant } from "@/lib/db/words";
import { validateTextLength, validateDateNotFuture } from "@/lib/utils/validation";

interface Params {
  params: Promise<{ id: string; wordId: string }>;
}

export async function POST(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  const { wordId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { variant?: unknown; recorded_at?: unknown };

  const variantVal = validateTextLength(String(body.variant ?? ""), 1, 200);
  if (!variantVal.valid) return NextResponse.json({ error: variantVal.error }, { status: 400 });

  const dateVal = validateDateNotFuture(String(body.recorded_at ?? ""));
  if (!dateVal.valid) return NextResponse.json({ error: dateVal.error }, { status: 400 });

  const variant = await addWordVariant(wordId, {
    variant: String(body.variant),
    recorded_at: String(body.recorded_at),
  });

  return NextResponse.json(variant, { status: 201 });
}
