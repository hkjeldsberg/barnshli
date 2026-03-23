import React from "react";
import Link from "next/link";
import { Badge } from "@/components/ui/Badge";
import { calculateAgeMonths, formatAge } from "@/lib/utils/age";
import type { Child } from "@/lib/db/children";

interface ChildHeaderProps {
  child: Child;
}

const tabs = [
  { label: "Overview", href: "" },
  { label: "Growth", href: "/growth" },
  { label: "Words", href: "/words" },
  { label: "Milestones", href: "/milestones" },
];

export function ChildHeader({ child }: ChildHeaderProps): React.JSX.Element {
  const ageMonths = calculateAgeMonths(new Date(child.date_of_birth));
  const ageLabel = formatAge(ageMonths);
  const base = `/children/${child.id}`;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-1">
        <h1 className="font-display text-3xl font-extrabold text-slate-800">
          {child.name}
        </h1>
        <Badge
          label={child.sex === "male" ? "Boy" : "Girl"}
          variant={child.sex === "male" ? "male" : "female"}
        />
      </div>
      <p className="text-sm text-slate-500 mb-5">{ageLabel} old</p>

      {/* Tab navigation */}
      <nav
        className="flex gap-1 border-b border-cream-200"
        aria-label="Child section navigation"
      >
        {tabs.map(({ label, href }) => (
          <Link
            key={href}
            href={`${base}${href}`}
            className="px-4 py-2 text-sm font-semibold text-slate-600 hover:text-slate-900 border-b-2 border-transparent hover:border-sage transition-colors"
          >
            {label}
          </Link>
        ))}
      </nav>
    </div>
  );
}
