import React from "react";

type BadgeVariant = "who" | "cdc" | "aap" | "male" | "female" | "default";

interface BadgeProps {
  label: string;
  variant?: BadgeVariant;
  className?: string;
}

const variantClasses: Record<BadgeVariant, string> = {
  who: "bg-sky-blue-100 text-sky-blue-600 border-sky-blue-200",
  cdc: "bg-sage-100 text-sage-600 border-sage-200",
  aap: "bg-peach-100 text-peach-700 border-peach-300",
  male: "bg-sky-blue-100 text-sky-blue-600 border-sky-blue-200",
  female: "bg-dusty-rose-100 text-dusty-rose-700 border-dusty-rose-300",
  default: "bg-cream-100 text-slate-600 border-cream-200",
};

export function Badge({
  label,
  variant = "default",
  className = "",
}: BadgeProps): React.JSX.Element {
  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold font-display",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}
