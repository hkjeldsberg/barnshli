import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { deleteWordEntry } from "@/lib/db/words";

interface Params {
  params: Promise<{ id: string; wordId: string }>;
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
