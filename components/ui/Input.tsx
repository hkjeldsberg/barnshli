import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
  required?: boolean;
  id: string;
}

export function Input({
  label,
  error,
  required,
  id,
  className = "",
  ...props
}: InputProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-1">
      <label
        htmlFor={id}
        className="text-sm font-semibold text-slate-700 font-display"
      >
        {label}
        {required && (
          <span className="text-dusty-rose ml-1" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <input
        id={id}
        aria-describedby={error ? `${id}-error` : undefined}
        aria-invalid={!!error}
        required={required}
        className={[
          "w-full rounded-2xl border px-4 py-2.5 text-slate-800 bg-cream-50",
          "placeholder:text-slate-400 transition-colors duration-150",
          "focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage",
          "min-h-[44px]",
          error
            ? "border-dusty-rose-500 focus:ring-dusty-rose focus:border-dusty-rose"
            : "border-cream-200",
          className,
        ].join(" ")}
        {...props}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="text-sm text-dusty-rose-700">
          {error}
        </p>
      )}
    </div>
  );
}
