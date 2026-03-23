"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import {
  validateDateNotFuture,
  validateTextLength,
} from "@/lib/utils/validation";

export function OnboardingForm(): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | undefined>();
  const [childNameError, setChildNameError] = useState<string | undefined>();
  const [dobError, setDobError] = useState<string | undefined>();

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const displayName = formData.get("display_name") as string;
    const childName = formData.get("child_name") as string;
    const dateOfBirth = formData.get("date_of_birth") as string;
    const sex = formData.get("sex") as string;

    const nameVal = validateTextLength(displayName, 1, 100);
    const childNameVal = validateTextLength(childName, 1, 100);
    const dobVal = validateDateNotFuture(dateOfBirth);

    setNameError(nameVal.error);
    setChildNameError(childNameVal.error);
    setDobError(dobVal.error);

    if (!nameVal.valid || !childNameVal.valid || !dobVal.valid) return;

    setLoading(true);
    const response = await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ display_name: displayName, child_name: childName, date_of_birth: dateOfBirth, sex }),
    });

    setLoading(false);

    if (!response.ok) {
      const json = (await response.json()) as { error?: string };
      setError(json.error ?? "Something went wrong. Please try again.");
      return;
    }

    router.push("/dashboard");
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-6">
      <div>
        <h2 className="font-display text-xl font-bold text-slate-800">
          Welcome to Barnshli!
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Let&apos;s set up your profile and add your first child.
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-2xl bg-dusty-rose-100 border border-dusty-rose-300 px-4 py-3 text-sm text-dusty-rose-700">
          {error}
        </div>
      )}

      {/* Parent profile */}
      <section className="flex flex-col gap-4">
        <h3 className="font-display font-semibold text-slate-700 text-sm uppercase tracking-wide">
          About you
        </h3>
        <Input
          id="display_name"
          name="display_name"
          type="text"
          label="Your name"
          placeholder="What should we call you?"
          autoComplete="name"
          required
          error={nameError}
        />
      </section>

      {/* Child profile */}
      <section className="flex flex-col gap-4">
        <h3 className="font-display font-semibold text-slate-700 text-sm uppercase tracking-wide">
          Your child
        </h3>
        <Input
          id="child_name"
          name="child_name"
          type="text"
          label="Child's name"
          placeholder="e.g. Oliver"
          required
          error={childNameError}
        />
        <Input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          label="Date of birth"
          max={new Date().toISOString().split("T")[0]}
          required
          error={dobError}
        />

        {/* Sex radio group */}
        <fieldset>
          <legend className="text-sm font-semibold text-slate-700 font-display mb-2">
            Sex <span className="text-dusty-rose" aria-hidden="true">*</span>
          </legend>
          <div className="flex gap-4">
            {(["male", "female"] as const).map((value) => (
              <label
                key={value}
                className="flex items-center gap-2 cursor-pointer text-sm text-slate-700 font-body"
              >
                <input
                  type="radio"
                  name="sex"
                  value={value}
                  defaultChecked={value === "male"}
                  required
                  className="accent-sage w-4 h-4"
                />
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </label>
            ))}
          </div>
        </fieldset>
      </section>

      <Button type="submit" loading={loading} className="w-full">
        Get started
      </Button>
    </form>
  );
}
