import React from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { listChildren } from "@/lib/db/children";

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

  const children_list = user ? await listChildren(user.id) : [];

  const navLinks = [
    { href: "/dashboard", label: "Dashboard", icon: "🏠" },
    ...children_list.map((c) => ({
      href: `/children/${c.id}`,
      label: c.name,
      icon: "👶",
    })),
  ];

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar — desktop (≥1024px) */}
      <aside className="hidden lg:flex flex-col fixed inset-y-0 left-0 w-64 bg-cream-50 border-r border-cream-200 shadow-clay-sm z-20 p-6 gap-6">
        <Link
          href="/dashboard"
          className="font-display text-2xl font-extrabold text-slate-800 tracking-tight"
        >
          Barnshli
        </Link>
        <nav className="flex flex-col gap-1 flex-1" aria-label="Main navigation">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-semibold text-slate-700 hover:bg-cream-100 transition-colors"
            >
              <span aria-hidden="true">{link.icon}</span>
              {link.label}
            </Link>
          ))}
        </nav>
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

      {/* Bottom nav — mobile (≤640px) */}
      <nav
        className="lg:hidden fixed bottom-0 inset-x-0 bg-cream-50 border-t border-cream-200 flex items-center justify-around px-2 py-2 z-20"
        aria-label="Mobile navigation"
      >
        {navLinks.slice(0, 5).map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center text-xs text-slate-600 hover:text-slate-900"
          >
            <span className="text-xl" aria-hidden="true">
              {link.icon}
            </span>
            <span className="truncate max-w-[60px]">{link.label}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
