import type { Metadata } from "next";
import React from "react";
import { createClient } from "@/lib/supabase/server";
import { listChildren } from "@/lib/db/children";
import { ChildCard } from "@/components/children/ChildCard";
import { AddChildPrompt } from "@/components/children/AddChildPrompt";
import { redirect } from "next/navigation";
import Link from "next/link";

export const metadata: Metadata = { title: "Hjem" };

export default async function DashboardPage(): Promise<React.JSX.Element> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const children = await listChildren(user.id);

  return (
    <div>
      <h1 className="font-display text-3xl font-extrabold text-slate-800 mb-6">
        Barna dine
      </h1>

      {children.length === 0 ? (
        <AddChildPrompt />
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {children.map((child) => (
              <ChildCard key={child.id} child={child} />
            ))}
          </div>
          <div className="mt-6">
            <Link
              href="/children/new"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-semibold text-sage-600 bg-sage-100 hover:bg-sage-200 transition-colors"
            >
              + Legg til barn
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
