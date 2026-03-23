"use client";

import React, { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function ResetPasswordPage(): React.JSX.Element {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.resetPasswordForEmail(
      email,
      {
        redirectTo: `${window.location.origin}/api/auth/callback`,
      },
    );

    setLoading(false);

    if (authError) {
      setError("Something went wrong. Please try again.");
      return;
    }

    setSent(true);
  }

  if (sent) {
    return (
      <div className="text-center flex flex-col gap-3">
        <h2 className="font-display text-xl font-bold text-slate-800">
          Check your email
        </h2>
        <p className="text-sm text-slate-500">
          We&apos;ve sent a reset link to your email address. It may take a
          minute to arrive.
        </p>
        <a href="/login" className="text-sm text-sage-600 hover:underline font-semibold">
          Back to sign in
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-800">
          Reset your password
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl bg-dusty-rose-100 border border-dusty-rose-300 px-4 py-3 text-sm text-dusty-rose-700">
          {error}
        </div>
      )}

      <Input
        id="email"
        name="email"
        type="email"
        label="Email address"
        placeholder="you@example.com"
        autoComplete="email"
        required
      />

      <Button type="submit" loading={loading} className="w-full">
        Send reset link
      </Button>

      <p className="text-center">
        <a href="/login" className="text-sm text-sage-600 hover:underline font-semibold">
          Back to sign in
        </a>
      </p>
    </form>
  );
}
