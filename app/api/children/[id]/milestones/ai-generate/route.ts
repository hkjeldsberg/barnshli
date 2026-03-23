import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { getChild } from "@/lib/db/children";
import { getAIChecklistForBand, bulkInsertAIChecklist } from "@/lib/db/milestones";
import { calculateAgeMonths, getAgeBand } from "@/lib/utils/age";
import { buildMilestonePrompt } from "@/lib/ai/prompts/milestones";
import type { AgeBand } from "@/lib/utils/age";

interface Params {
  params: Promise<{ id: string }>;
}

export async function POST(
  _request: Request,
  { params }: Params,
): Promise<NextResponse> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const child = await getChild(id, user.id);
  if (!child) return NextResponse.json({ error: "Child not found" }, { status: 404 });

  const ageMonths = calculateAgeMonths(new Date(child.date_of_birth));
  const ageBand = getAgeBand(ageMonths);

  if (!ageBand) {
    return NextResponse.json(
      { error: "Child is outside the supported age range (0–5 years)" },
      { status: 400 },
    );
  }

  // Idempotent: return cached checklist if it already exists for this age band
  const existing = await getAIChecklistForBand(id, ageBand);
  if (existing.length > 0) {
    return NextResponse.json(existing);
  }

  // Call Claude to generate milestones
  const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const prompt = buildMilestonePrompt(ageBand as AgeBand, child.sex as "male" | "female");

  let milestoneTexts: string[];
  try {
    const message = await anthropic.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    });

    const content = message.content[0];
    if (content.type !== "text") {
      throw new Error("Unexpected response type from Claude");
    }

    const parsed = JSON.parse(content.text) as unknown;
    if (
      !Array.isArray(parsed) ||
      !parsed.every((item): item is string => typeof item === "string")
    ) {
      throw new Error("Claude response was not a string array");
    }
    milestoneTexts = parsed;
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json(
      { error: `Failed to generate milestones: ${message}` },
      { status: 502 },
    );
  }

  const milestones = await bulkInsertAIChecklist(id, ageBand, milestoneTexts);
  return NextResponse.json(milestones, { status: 201 });
}
