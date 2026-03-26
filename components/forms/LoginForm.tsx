"use client";

import React, { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function LoginForm(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
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
    const { error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (authError) {
      setError("Feil e-post eller passord. Vennligst prøv igjen.");
      return;
    }

    const returnTo = searchParams.get("returnTo");
    const destination =
      returnTo && returnTo.startsWith("/") ? returnTo : "/dashboard";
    router.push(destination);
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-800">
          Velkommen tilbake
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Logg inn på din Barnshli-konto.
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
        label="E-postadresse"
        placeholder="deg@eksempel.no"
        autoComplete="email"
        required
      />

      <Input
        id="password"
        name="password"
        type="password"
        label="Passord"
        placeholder="Ditt passord"
        autoComplete="current-password"
        required
      />

      <div className="text-right">
        <a
          href="/reset-password"
          className="text-sm text-sage-600 hover:underline font-semibold"
        >
          Glemt passordet?
        </a>
      </div>

      <Button type="submit" loading={loading} className="w-full">
        Logg inn
      </Button>

      <p className="text-center text-sm text-slate-500">
        Har du ikke konto?{" "}
        <a href="/register" className="font-semibold text-sage-600 hover:underline">
          Opprett en
        </a>
      </p>
    </form>
  );
}
