import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChild } from "@/lib/db/children";
import { listWordEntries } from "@/lib/db/words";
import { ChildHeader } from "@/components/children/ChildHeader";
import { WordDiary } from "@/components/children/WordDiary";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { title: "Ordbok" };
  const child = await getChild(id, user.id);
  return { title: child ? `${child.name} — Ordbok` : "Ordbok" };
}

export default async function WordsPage({ params }: Props): Promise<React.JSX.Element> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const child = await getChild(id, user.id);
  if (!child) notFound();

  const entries = await listWordEntries(id);

  return (
    <div>
      <ChildHeader child={child} />

      <div className="clay-card p-6">
        <h2 className="text-xl font-bold text-[var(--color-text-primary)] mb-4">Ordbok</h2>
        <p className="text-sm text-[var(--color-text-secondary)] mb-6">
          Følg hvert ord barnet lærer og hvordan uttalen utvikler seg over tid.
        </p>
        <WordDiary childId={id} initialEntries={entries} />
      </div>
    </div>
  );
}
