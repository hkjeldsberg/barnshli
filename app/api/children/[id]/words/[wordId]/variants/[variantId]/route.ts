import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { updateWordVariant } from "@/lib/db/words";
import { validateDateNotFuture } from "@/lib/utils/validation";

interface Params {
  params: Promise<{ id: string; wordId: string; variantId: string }>;
}

export async function PATCH(
  request: Request,
  { params }: Params,
): Promise<NextResponse> {
  const { variantId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as { recorded_at?: unknown };

  const dateVal = validateDateNotFuture(String(body.recorded_at ?? ""));
  if (!dateVal.valid) return NextResponse.json({ error: dateVal.error }, { status: 400 });

  const variant = await updateWordVariant(variantId, {
    recorded_at: String(body.recorded_at),
  });

  return NextResponse.json(variant);
}
