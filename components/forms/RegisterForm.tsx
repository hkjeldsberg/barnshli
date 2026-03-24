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
          "En konto med denne e-postadressen finnes allerede. Prøv å logge inn i stedet.",
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
          Opprett konto
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Familiens data holdes privat og trygg.
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
        placeholder="Minst 8 tegn"
        autoComplete="new-password"
        minLength={8}
        required
      />

      <Button type="submit" loading={loading} className="w-full">
        Opprett konto
      </Button>

      <p className="text-center text-sm text-slate-500">
        Har du allerede konto?{" "}
        <a href="/login" className="font-semibold text-sage-600 hover:underline">
          Logg inn
        </a>
      </p>
    </form>
  );
}
