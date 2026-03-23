import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChild } from "@/lib/db/children";
import { listMilestones } from "@/lib/db/milestones";
import { ChildHeader } from "@/components/children/ChildHeader";
import { MilestoneTimeline } from "@/components/children/MilestoneTimeline";
import { AIChecklist } from "@/components/children/AIChecklist";
import { calculateAgeMonths, getAgeBand } from "@/lib/utils/age";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { title: "Milestones" };
  const child = await getChild(id, user.id);
  return { title: child ? `${child.name} — Milestones` : "Milestones" };
}

export default async function MilestonesPage({ params }: Props): Promise<React.JSX.Element> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const child = await getChild(id, user.id);
  if (!child) notFound();

  const [allMilestones] = await Promise.all([listMilestones(id)]);

  const ageMonths = calculateAgeMonths(new Date(child.date_of_birth));
  const ageBand = getAgeBand(ageMonths);

  const aiMilestones = allMilestones.filter((m) => !m.is_custom);

  return (
    <div>
      <ChildHeader child={child} />

      <div className="space-y-6">
        {ageBand && (
          <div className="clay-card p-6">
            <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
              AI Developmental Checklist
            </h2>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
              AI-generated milestones for the {ageBand} age band, based on WHO and AAP guidelines.
            </p>
            <AIChecklist
              childId={id}
              ageBand={ageBand}
              initialMilestones={aiMilestones}
            />
          </div>
        )}

        <div className="clay-card p-6">
          <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
            My Milestones
          </h2>
          <p className="text-sm text-[var(--color-text-secondary)] mb-4">
            Record your own special milestones and achievements.
          </p>
          <MilestoneTimeline childId={id} initialMilestones={allMilestones} />
        </div>
      </div>
    </div>
  );
}
