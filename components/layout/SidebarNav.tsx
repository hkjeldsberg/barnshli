"use client";

import React from "react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import type { Child } from "@/lib/db/children";

const CHILD_TABS = [
  { label: "Oversikt", href: "" },
  { label: "Vekst", href: "/growth" },
  { label: "Ordbok", href: "/words" },
  { label: "Milepæler", href: "/milestones" },
];

interface SidebarNavProps {
  childrenList: Child[];
}

export function SidebarNav({ childrenList }: SidebarNavProps): React.JSX.Element {
  const params = useParams();
  const pathname = usePathname();
  const activeChildId = params?.id as string | undefined;

  return (
    <nav
      className="flex flex-col gap-1 flex-1 overflow-y-auto"
      aria-label="Main navigation"
    >
      {childrenList.length > 0 && (
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 pt-1 pb-1">
          Barn
        </p>
      )}

      {childrenList.map((child) => {
        const isActive = activeChildId === child.id;
        return (
          <React.Fragment key={child.id}>
            <Link
              href={`/children/${child.id}`}
              className={[
                "flex items-center gap-3 px-3 py-2 rounded-2xl text-sm font-semibold transition-colors",
                isActive
                  ? "bg-cream-200 text-slate-900"
                  : "text-slate-700 hover:bg-cream-100",
              ].join(" ")}
            >
              <span aria-hidden="true">
                {child.sex === "female" ? "👧" : "👦"}
              </span>
              {child.name}
            </Link>

            {/* Child sub-tabs shown only for the active child */}
            {isActive && (
              <div className="ml-4 flex flex-col gap-0.5 mb-1">
                {CHILD_TABS.map(({ label, href }) => {
                  const tabPath = `/children/${child.id}${href}`;
                  const isTabActive =
                    href === ""
                      ? pathname === tabPath
                      : pathname.startsWith(tabPath);
                  return (
                    <Link
                      key={label}
                      href={tabPath}
                      className={[
                        "px-3 py-1.5 rounded-xl text-sm font-medium transition-colors",
                        isTabActive
                          ? "bg-sage-100 text-sage-600 font-semibold"
                          : "text-slate-500 hover:text-slate-700 hover:bg-cream-100",
                      ].join(" ")}
                    >
                      {label}
                    </Link>
                  );
                })}
              </div>
            )}
          </React.Fragment>
        );
      })}

      <Link
        href="/children/new"
        className="flex items-center gap-2 px-3 py-2 mt-1 rounded-2xl text-sm font-semibold text-sage-600 hover:bg-sage-100 transition-colors"
      >
        <span aria-hidden="true" className="text-lg font-bold">
          +
        </span>
        Legg til barn
      </Link>
    </nav>
  );
}
