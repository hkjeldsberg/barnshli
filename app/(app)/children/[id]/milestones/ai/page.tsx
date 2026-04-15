import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChild } from "@/lib/db/children";
import {
  getAIChecklistForBand,
  getUserChallengesForBand,
} from "@/lib/db/milestones";
import { ChildHeader } from "@/components/children/ChildHeader";
import { AIChecklist } from "@/components/children/AIChecklist";
import { calculateAgeMonths, getAgeBand } from "@/lib/utils/age";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { title: "AI-sjekkliste" };
  const child = await getChild(id, user.id);
  return { title: child ? `${child.name} — AI-sjekkliste` : "AI-sjekkliste" };
}

export default async function AIChecklistPage({
  params,
}: Props): Promise<React.JSX.Element> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const child = await getChild(id, user.id);
  if (!child) notFound();

  const ageMonths = calculateAgeMonths(new Date(child.date_of_birth));
  const ageBand = getAgeBand(ageMonths);

  const [aiMilestones, userChallenges] = ageBand
    ? await Promise.all([
        getAIChecklistForBand(id, ageBand),
        getUserChallengesForBand(id, ageBand),
      ])
    : [[], []];

  return (
    <div>
      <div className="clay-card p-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
          AI-sjekkliste for utvikling
        </h2>
        {ageBand ? (
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            AI-genererte milepæler for aldersgruppen {ageBand}, basert på WHO og
            AAP retningslinjer.
          </p>
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Barnets alder er utenfor 0–5 år-området.
          </p>
        )}
        {ageBand && (
          <AIChecklist
            childId={id}
            ageBand={ageBand}
            initialMilestones={aiMilestones}
            initialChallenges={userChallenges}
          />
        )}
      </div>
    </div>
  );
}
