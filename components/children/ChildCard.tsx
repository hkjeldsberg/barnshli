import React from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { calculateAgeMonths, formatAge } from "@/lib/utils/age";
import type { Child } from "@/lib/db/children";

interface ChildCardProps {
  child: Child;
}

export function ChildCard({ child }: ChildCardProps): React.JSX.Element {
  const ageMonths = calculateAgeMonths(new Date(child.date_of_birth));
  const ageLabel = formatAge(ageMonths);

  return (
    <Link
      href={`/children/${child.id}`}
      aria-label={`View ${child.name}'s profile — ${ageLabel}`}
      className="block min-h-[44px] group animate-fade-up"
    >
      <Card className="transition-all duration-150 group-hover:-translate-y-1 group-hover:shadow-clay-lg">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-800">
              {child.name}
            </h3>
            <p className="mt-1 text-sm text-slate-500">{ageLabel}</p>
          </div>
          <Badge
            label={child.sex === "male" ? "Boy" : "Girl"}
            variant={child.sex === "male" ? "male" : "female"}
          />
        </div>
      </Card>
    </Link>
  );
}
