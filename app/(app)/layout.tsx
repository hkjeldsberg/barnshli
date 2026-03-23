import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listChildren } from "@/lib/db/children";
import { SidebarNav } from "@/components/layout/SidebarNav";

async function signOut(): Promise<void> {
  "use server";
  const { createClient: create } = await import("@/lib/supabase/server");
  const supabase = await create();
  await supabase.auth.signOut();
  const { redirect } = await import("next/navigation");
  redirect("/login");
}

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.JSX.Element> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const childrenList = user ? await listChildren(user.id) : [];

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar — desktop (≥1024px) */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-cream-50 border-r border-cream-200 shadow-clay-sm z-20 p-6 gap-6">
        {/* App name → navigates to dashboard */}
        <Link
          href="/dashboard"
          className="font-display text-2xl font-extrabold text-slate-800 tracking-tight hover:text-sage-600 transition-colors"
        >
          barnshli
        </Link>

        {/* Dynamic nav: children list + child tabs when on a child page */}
        <SidebarNav childrenList={childrenList} />

        <form action={signOut}>
          <button
            type="submit"
            className="w-full text-left px-3 py-2 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-cream-100 hover:text-slate-700 transition-colors"
          >
            Sign out
          </button>
        </form>
      </aside>

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 py-8">{children}</div>
      </main>

      {/* Bottom nav — mobile */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 bg-cream-50 border-t border-cream-200 flex items-center justify-around px-2 py-2 z-20"
        aria-label="Mobile navigation"
      >
        <Link
          href="/dashboard"
          className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center text-xs text-slate-600 hover:text-slate-900"
        >
          <span className="text-xl" aria-hidden="true">🏠</span>
          <span>Home</span>
        </Link>
        {childrenList.slice(0, 4).map((child) => (
          <Link
            key={child.id}
            href={`/children/${child.id}`}
            className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center text-xs text-slate-600 hover:text-slate-900"
          >
            <span className="text-xl" aria-hidden="true">
              {child.sex === "female" ? "👧" : "👦"}
            </span>
            <span className="truncate max-w-[60px]">{child.name}</span>
          </Link>
        ))}
        <Link
          href="/children/new"
          className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center text-xs text-sage-600"
        >
          <span className="text-xl" aria-hidden="true">+</span>
          <span>Add</span>
        </Link>
      </nav>
    </div>
  );
}
