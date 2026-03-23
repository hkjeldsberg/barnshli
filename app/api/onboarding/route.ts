import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { upsertProfile } from "@/lib/db/profiles";
import { createChild } from "@/lib/db/children";
import {
  validateDateNotFuture,
  validateTextLength,
} from "@/lib/utils/validation";

export async function POST(request: Request): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json()) as {
    display_name?: unknown;
    child_name?: unknown;
    date_of_birth?: unknown;
    sex?: unknown;
  };

  const nameVal = validateTextLength(String(body.display_name ?? ""), 1, 100);
  if (!nameVal.valid) {
    return NextResponse.json({ error: nameVal.error }, { status: 400 });
  }

  const childNameVal = validateTextLength(String(body.child_name ?? ""), 1, 100);
  if (!childNameVal.valid) {
    return NextResponse.json({ error: childNameVal.error }, { status: 400 });
  }

  const dobVal = validateDateNotFuture(String(body.date_of_birth ?? ""));
  if (!dobVal.valid) {
    return NextResponse.json({ error: dobVal.error }, { status: 400 });
  }

  if (body.sex !== "male" && body.sex !== "female") {
    return NextResponse.json(
      { error: "Sex must be 'male' or 'female'." },
      { status: 400 },
    );
  }

  await upsertProfile(user.id, { display_name: String(body.display_name) });
  await createChild(user.id, {
    name: String(body.child_name),
    date_of_birth: String(body.date_of_birth),
    sex: body.sex,
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
