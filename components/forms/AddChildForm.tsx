"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";

export function AddChildForm(): React.JSX.Element {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const form = e.currentTarget;
    const data = {
      name: (form.elements.namedItem("name") as HTMLInputElement).value.trim(),
      date_of_birth: (form.elements.namedItem("date_of_birth") as HTMLInputElement).value,
      sex: (form.elements.namedItem("sex") as HTMLInputElement).value,
    };

    const res = await fetch("/api/children", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    if (!res.ok) {
      const { error: msg } = await res.json().catch(() => ({ error: "Something went wrong" }));
      setError(msg ?? "Failed to add child");
      setLoading(false);
      return;
    }

    const child = await res.json();
    router.push(`/children/${child.id}`);
    router.refresh();
  }

  const inputClass =
    "w-full rounded-2xl border border-cream-200 bg-cream-50 px-4 py-3 text-sm font-body text-slate-800 shadow-clay-sm focus:outline-none focus:ring-2 focus:ring-sage focus:border-sage transition-colors";
  const labelClass = "block text-sm font-semibold text-slate-700 mb-1.5";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label htmlFor="name" className={labelClass}>
          Child&apos;s name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          required
          autoComplete="off"
          placeholder="e.g. Sofia"
          className={inputClass}
        />
      </div>

      <div>
        <label htmlFor="date_of_birth" className={labelClass}>
          Date of birth
        </label>
        <input
          id="date_of_birth"
          name="date_of_birth"
          type="date"
          required
          max={new Date().toISOString().split("T")[0]}
          className={inputClass}
        />
      </div>

      <fieldset>
        <legend className={labelClass}>Sex</legend>
        <div className="flex gap-4">
          {(["female", "male"] as const).map((sex) => (
            <label
              key={sex}
              className="flex items-center gap-2 cursor-pointer text-sm font-medium text-slate-700"
            >
              <input
                type="radio"
                name="sex"
                value={sex}
                required
                className="accent-sage w-4 h-4"
                defaultChecked={sex === "female"}
              />
              {sex === "female" ? "Girl" : "Boy"}
            </label>
          ))}
        </div>
      </fieldset>

      {error && (
        <p role="alert" className="text-sm text-dusty-rose-700">
          {error}
        </p>
      )}

      <Button type="submit" loading={loading}>
        Add child
      </Button>
    </form>
  );
}
