import React from "react";

interface LabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
  required?: boolean;
  children: React.ReactNode;
}

export function Label({
  required,
  className = "",
  children,
  ...props
}: LabelProps): React.JSX.Element {
  return (
    <label
      className={["text-sm font-semibold text-slate-700 font-display", className].join(" ")}
      {...props}
    >
      {children}
      {required && (
        <span className="text-dusty-rose ml-1" aria-hidden="true">
          *
        </span>
      )}
    </label>
  );
}
