import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { listChildren, createChild } from "@/lib/db/children";
import {
  validateDateNotFuture,
  validateTextLength,
} from "@/lib/utils/validation";

export async function GET(): Promise<NextResponse> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const children = await listChildren(user.id);
  return NextResponse.json(children);
}

export async function POST(request: Request): Promise<NextResponse> {
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

  const nameValidation = validateTextLength(String(body.name ?? ""), 1, 100);
  if (!nameValidation.valid) {
    return NextResponse.json({ error: nameValidation.error }, { status: 400 });
  }

  const dateValidation = validateDateNotFuture(String(body.date_of_birth ?? ""));
  if (!dateValidation.valid) {
    return NextResponse.json({ error: dateValidation.error }, { status: 400 });
  }

  if (body.sex !== "male" && body.sex !== "female") {
    return NextResponse.json(
      { error: "Sex must be 'male' or 'female'." },
      { status: 400 },
    );
  }

  const child = await createChild(user.id, {
    name: String(body.name),
    date_of_birth: String(body.date_of_birth),
    sex: body.sex,
  });

  return NextResponse.json(child, { status: 201 });
}
