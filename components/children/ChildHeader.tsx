import React from "react";
import { Badge } from "@/components/ui/Badge";
import { calculateAgeMonths, formatAge } from "@/lib/utils/age";
import type { Child } from "@/lib/db/children";

interface ChildHeaderProps {
  child: Child;
}

export function ChildHeader({ child }: ChildHeaderProps): React.JSX.Element {
  const ageMonths = calculateAgeMonths(new Date(child.date_of_birth));
  const ageLabel = formatAge(ageMonths);

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
      <p className="text-sm text-slate-500">{ageLabel} old</p>
    </div>
  );
}
