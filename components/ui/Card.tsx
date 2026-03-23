import React from "react";

type CardVariant = "default" | "sage" | "rose" | "sky" | "peach";

interface CardProps {
  variant?: CardVariant;
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<CardVariant, string> = {
  default: "bg-cream-50 border-cream-200",
  sage: "bg-sage-100 border-sage-200",
  rose: "bg-dusty-rose-100 border-dusty-rose-300",
  sky: "bg-sky-blue-100 border-sky-blue-200",
  peach: "bg-peach-100 border-peach-300",
};

export function Card({
  variant = "default",
  className = "",
  children,
}: CardProps): React.JSX.Element {
  return (
    <div
      className={[
        "rounded-3xl border shadow-clay-md p-6 animate-scale-in",
        variantClasses[variant],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
