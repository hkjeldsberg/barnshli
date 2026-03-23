"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface GrowthFormProps {
  childId: string;
}

export function GrowthForm({ childId }: GrowthFormProps): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> {
    event.preventDefault();
    setError(null);
    setSuccess(false);
    setLoading(true);

    const formData = new FormData(event.currentTarget);
    const recorded_at = formData.get("recorded_at") as string;
    const weight_kg = formData.get("weight_kg") as string;
    const height_cm = formData.get("height_cm") as string;

    const response = await fetch(`/api/children/${childId}/growth`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        recorded_at,
        weight_kg: weight_kg ? parseFloat(weight_kg) : null,
        height_cm: height_cm ? parseFloat(height_cm) : null,
      }),
    });

    setLoading(false);

    if (!response.ok) {
      const json = (await response.json()) as { error?: string };
      setError(json.error ?? "Kunne ikke lagre måling.");
      return;
    }

    setSuccess(true);
    (event.target as HTMLFormElement).reset();
    router.refresh();
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <h3 className="font-display font-bold text-slate-800">
        Legg til måling
      </h3>

      {error && (
        <div role="alert" className="rounded-2xl bg-dusty-rose-100 border border-dusty-rose-300 px-4 py-3 text-sm text-dusty-rose-700">
          {error}
        </div>
      )}

      {success && (
        <div role="status" className="rounded-2xl bg-sage-100 border border-sage-200 px-4 py-3 text-sm text-sage-600">
          Måling lagret.
        </div>
      )}

      <Input
        id="recorded_at"
        name="recorded_at"
        type="date"
        label="Dato"
        max={new Date().toISOString().split("T")[0]}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          id="weight_kg"
          name="weight_kg"
          type="number"
          label="Vekt (kg)"
          placeholder="f.eks. 10.5"
          step="0.01"
          min="0.1"
          max="100"
        />
        <Input
          id="height_cm"
          name="height_cm"
          type="number"
          label="Høyde (cm)"
          placeholder="f.eks. 75.0"
          step="0.1"
          min="0.1"
          max="130"
        />
      </div>
      <p className="text-xs text-slate-400">
        Minst ett av feltene vekt eller høyde må fylles inn.
      </p>

      <Button type="submit" loading={loading} size="sm">
        Lagre måling
      </Button>
    </form>
  );
}
