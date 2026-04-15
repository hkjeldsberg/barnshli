"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";

const CHILD_TABS = [
  { label: "Vekst", href: "/growth", icon: "📈" },
  { label: "Ordbok", href: "/words", icon: "💬" },
  { label: "Milepæler", href: "/milestones", icon: "⭐" },
] as const;

export function MobileBottomNav(): React.JSX.Element {
  const params = useParams();
  const pathname = usePathname();
  const childId = params?.id as string | undefined;

  return (
    <nav
      className="lg:hidden fixed bottom-0 inset-x-0 bg-cream-50 border-t border-cream-200 flex items-center justify-around px-2 py-2 z-20"
      aria-label="Mobil navigasjon"
    >
      {childId ? (
        CHILD_TABS.map(({ label, href, icon }) => {
          const tabPath = `/children/${childId}${href}`;
          const isActive = pathname.startsWith(tabPath);
          return (
            <Link
              key={label}
              href={tabPath}
              className={[
                "flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center text-xs transition-colors",
                isActive
                  ? "text-sage-600 font-semibold"
                  : "text-slate-600 hover:text-slate-900",
              ].join(" ")}
            >
              <span className="text-xl" aria-hidden="true">
                {icon}
              </span>
              <span>{label}</span>
            </Link>
          );
        })
      ) : (
        <>
          <Link
            href="/dashboard"
            className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center text-xs text-slate-600 hover:text-slate-900 transition-colors"
          >
            <span className="text-xl" aria-hidden="true">
              🏠
            </span>
            <span>Hjem</span>
          </Link>
          <Link
            href="/children/new"
            className="flex flex-col items-center gap-1 min-w-[44px] min-h-[44px] justify-center text-xs text-sage-600 hover:text-sage-700 transition-colors"
          >
            <span className="text-xl" aria-hidden="true">
              +
            </span>
            <span>Legg til</span>
          </Link>
        </>
      )}
    </nav>
  );
}
