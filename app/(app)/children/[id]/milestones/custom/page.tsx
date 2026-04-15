import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChild } from "@/lib/db/children";
import { listMilestones } from "@/lib/db/milestones";
import { ChildHeader } from "@/components/children/ChildHeader";
import { MilestoneTimeline } from "@/components/children/MilestoneTimeline";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { title: "Mine milepæler" };
  const child = await getChild(id, user.id);
  return { title: child ? `${child.name} — Mine milepæler` : "Mine milepæler" };
}

export default async function CustomMilestonesPage({
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

  const customMilestones = await listMilestones(id, "custom");

  return (
    <div>
      <div className="clay-card p-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-2">
          Mine milepæler
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-4">
          Registrer barnets egne spesielle øyeblikk og bragder.
        </p>
        <MilestoneTimeline
          childId={id}
          dateOfBirth={child.date_of_birth}
          initialMilestones={customMilestones}
        />
      </div>
    </div>
  );
}
