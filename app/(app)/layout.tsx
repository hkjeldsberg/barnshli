import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listChildren } from "@/lib/db/children";
import { SidebarNav } from "@/components/layout/SidebarNav";
import { MobileSidebarDrawer } from "@/components/layout/MobileSidebarDrawer";
import { MobileBottomNav } from "@/components/layout/MobileBottomNav";
import { SessionGuard } from "@/components/auth/SessionGuard";

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
      <SessionGuard />
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
            Logg ut
          </button>
        </form>
      </aside>

      {/* Mobile sidebar drawer — hidden on desktop */}
      <MobileSidebarDrawer childrenList={childrenList} signOut={signOut} />

      {/* Main content */}
      <main className="flex-1 lg:ml-64 pb-20 lg:pb-0">
        <div className="max-w-4xl mx-auto px-4 pt-16 pb-8 lg:py-8">{children}</div>
      </main>

      {/* Bottom nav — mobile */}
      <MobileBottomNav />
    </div>
  );
}
