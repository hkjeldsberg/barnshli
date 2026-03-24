"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

interface Props {
  children: React.ReactNode;
}

export default function MilestonesLayout({
  children,
}: Props): React.JSX.Element {
  const pathname = usePathname();

  // Resolve id synchronously from the URL since layout needs it for links.
  // In the app router, params is a promise but the URL is already available.
  const segments = pathname.split("/");
  const idIndex = segments.indexOf("children") + 1;
  const id = segments[idIndex] ?? "";

  const tabs: { label: string; href: string }[] = [
    { label: "AI-sjekkliste", href: `/children/${id}/milestones/ai` },
    { label: "Mine milepæler", href: `/children/${id}/milestones/custom` },
  ];

  return (
    <div>
      <nav
        aria-label="Milepæler navigasjon"
        className="flex gap-1 border-b border-cream-200 mb-6"
      >
        {tabs.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`
                px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors
                min-h-[44px] flex items-center
                ${isActive
                  ? "bg-cream-50 border border-b-cream-50 border-cream-200 text-sage-700 -mb-px"
                  : "text-slate-500 hover:text-slate-700"
                }
              `}
              aria-current={isActive ? "page" : undefined}
            >
              {tab.label}
            </Link>
          );
        })}
      </nav>
      {children}
    </div>
  );
}
