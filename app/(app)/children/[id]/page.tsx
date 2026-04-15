import type { Metadata } from "next";
import React from "react";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getChild } from "@/lib/db/children";
import { ChildHeader } from "@/components/children/ChildHeader";
import Link from "next/link";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { title: "Child" };
  const child = await getChild(id, user.id);
  return { title: child?.name ?? "Child" };
}

export default async function ChildDetailPage({
  params,
}: Props): Promise<React.JSX.Element> {
  const { id } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();

  const child = await getChild(id, user.id);
  if (!child) notFound();

  return (
    <div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { href: `/children/${id}/growth`, label: "Vekst", icon: "📈", desc: "Følg vekt og høyde" },
          { href: `/children/${id}/words`, label: "Ordbok", icon: "💬", desc: "Første ord og uttaler" },
          { href: `/children/${id}/milestones`, label: "Milepæler", icon: "⭐", desc: "Bragder og AI-sjekkliste" },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="block group animate-fade-up"
            aria-label={item.label}
          >
            <div className="rounded-3xl border border-cream-200 shadow-clay-sm bg-cream-50 p-5 transition-all duration-150 group-hover:-translate-y-1 group-hover:shadow-clay-md">
              <div className="text-3xl mb-2" aria-hidden="true">{item.icon}</div>
              <h3 className="font-display font-bold text-slate-800">{item.label}</h3>
              <p className="text-sm text-slate-500 mt-1">{item.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
