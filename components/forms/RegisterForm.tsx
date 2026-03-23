"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function RegisterForm(): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    const supabase = createClient();
    const { error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/api/auth/callback`,
      },
    });

    setLoading(false);

    if (authError) {
      if (authError.message.toLowerCase().includes("already registered")) {
        setError(
          "An account with this email already exists. Try signing in instead.",
        );
      } else {
        setError(authError.message);
      }
      return;
    }

    router.push("/onboarding");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-800">
          Create your account
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Your family&apos;s data stays private and secure.
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

      <Input
        id="password"
        name="password"
        type="password"
        label="Password"
        placeholder="At least 8 characters"
        autoComplete="new-password"
        minLength={8}
        required
      />

      <Button type="submit" loading={loading} className="w-full">
        Create account
      </Button>

      <p className="text-center text-sm text-slate-500">
        Already have an account?{" "}
        <a href="/login" className="font-semibold text-sage-600 hover:underline">
          Sign in
        </a>
      </p>
    </form>
  );
}
