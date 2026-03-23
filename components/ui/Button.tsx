"use client";

import React from "react";

type Variant = "primary" | "secondary" | "ghost" | "destructive";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
}

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-sage text-white shadow-clay-sm hover:bg-sage-600 active:translate-y-0.5",
  secondary:
    "bg-cream-100 text-slate-800 shadow-clay-sm border border-cream-200 hover:bg-cream-200",
  ghost: "bg-transparent text-slate-700 hover:bg-cream-100",
  destructive:
    "bg-dusty-rose text-white shadow-clay-sm hover:bg-dusty-rose-700 active:translate-y-0.5",
};

const sizeClasses: Record<Size, string> = {
  sm: "px-3 py-1.5 text-sm min-h-[36px]",
  md: "px-4 py-2 text-base min-h-[44px]",
  lg: "px-6 py-3 text-lg min-h-[52px]",
};

export function Button({
  variant = "primary",
  size = "md",
  loading = false,
  disabled,
  className = "",
  children,
  ...props
}: ButtonProps): React.JSX.Element {
  return (
    <button
      {...props}
      disabled={disabled ?? loading}
      aria-busy={loading}
      className={[
        "inline-flex items-center justify-center gap-2 rounded-2xl font-display font-semibold",
        "transition-all duration-150 ease-in-out",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sage-600",
        "disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none",
        variantClasses[variant],
        sizeClasses[size],
        className,
      ].join(" ")}
    >
      {loading && (
        <span
          className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        />
      )}
      {children}
    </button>
  );
}
