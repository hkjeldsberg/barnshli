import React from "react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-cream px-4 py-12">
      {/* Logo / wordmark */}
      <div className="mb-8 text-center">
        <h1 className="font-display text-3xl font-extrabold text-slate-800 tracking-tight">
          Barnshli
        </h1>
        <p className="mt-1 text-sm text-slate-500 font-body">
          Your child&apos;s growth story, beautifully kept.
        </p>
      </div>

      {/* Auth card */}
      <div className="w-full max-w-md bg-cream-50 rounded-3xl shadow-clay-lg border border-cream-200 p-8 animate-scale-in">
        {children}
      </div>
    </div>
  );
}
