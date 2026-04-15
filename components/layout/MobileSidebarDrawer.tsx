"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { Child } from "@/lib/db/children";
import { SidebarNav } from "./SidebarNav";

interface Props {
  childrenList: Child[];
  signOut: () => Promise<void>;
}

export function MobileSidebarDrawer({
  childrenList,
  signOut,
}: Props): React.JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  // Close drawer on route change
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Hamburger toggle — mobile only */}
      <button
        className="lg:hidden fixed top-4 left-4 z-40 flex flex-col justify-center gap-1.5 w-10 h-10 rounded-xl bg-cream-50 border border-cream-200 shadow-clay-sm px-2"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={isOpen ? "Lukk meny" : "Åpne meny"}
        aria-expanded={isOpen}
        aria-controls="mobile-sidebar"
      >
        <span className="block w-full h-0.5 bg-slate-700 rounded" />
        <span className="block w-full h-0.5 bg-slate-700 rounded" />
        <span className="block w-full h-0.5 bg-slate-700 rounded" />
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-30"
          onClick={() => setIsOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Slide-in drawer */}
      <aside
        id="mobile-sidebar"
        className={[
          "lg:hidden fixed inset-y-0 left-0 w-64 bg-cream-50 border-r border-cream-200 shadow-clay-sm z-40 p-6 flex flex-col gap-6",
          "transition-transform duration-200",
          isOpen ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
      >
        <Link
          href="/dashboard"
          className="font-display text-2xl font-extrabold text-slate-800 tracking-tight hover:text-sage-600 transition-colors"
        >
          barnshli
        </Link>

        <SidebarNav childrenList={childrenList} />

        <form action={signOut} className="mt-auto">
          <button
            type="submit"
            className="w-full text-left px-3 py-2 rounded-2xl text-sm font-semibold text-slate-500 hover:bg-cream-100 hover:text-slate-700 transition-colors"
          >
            Logg ut
          </button>
        </form>
      </aside>
    </>
  );
}
