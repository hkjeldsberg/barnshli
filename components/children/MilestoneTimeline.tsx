"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { Milestone } from "@/lib/db/milestones";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { AGE_BANDS, type AgeBand } from "@/lib/utils/age";

interface MilestoneTimelineProps {
  childId: string;
  initialMilestones: Milestone[];
}

const AGE_BAND_LABELS: Record<AgeBand, string> = {
  "0-3mo": "0–3 months",
  "3-6mo": "3–6 months",
  "6-9mo": "6–9 months",
  "9-12mo": "9–12 months",
  "12-18mo": "12–18 months",
  "18-24mo": "18–24 months",
  "24-36mo": "2–3 years",
  "36-48mo": "3–4 years",
  "48-60mo": "4–5 years",
};

export function MilestoneTimeline({
  childId,
  initialMilestones,
}: MilestoneTimelineProps): React.JSX.Element {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", achieved_at: "", age_band: "" as AgeBand | "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  // Only show custom milestones in this component; AI milestones shown in AIChecklist
  const customMilestones = milestones.filter((m) => m.is_custom);

  async function handleAdd(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/children/${childId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setFormError(data.error ?? "Failed to add milestone");
        return;
      }
      const created = (await res.json()) as Milestone;
      setMilestones((prev) => [created, ...prev]);
      setForm({ title: "", achieved_at: "", age_band: "" });
      setAdding(false);
      router.refresh();
    } catch {
      setFormError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(milestoneId: string): Promise<void> {
    try {
      await fetch(`/api/children/${childId}/milestones/${milestoneId}`, { method: "DELETE" });
      setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
      router.refresh();
    } catch {
      // silent
    }
  }

  return (
    <div className="space-y-6">
      {/* Add milestone button / form */}
      {!adding ? (
        <Button onClick={() => setAdding(true)} size="sm">
          + Record Milestone
        </Button>
      ) : (
        <form
          onSubmit={handleAdd}
          className="clay-card p-4 space-y-3 bg-[var(--color-cream)]"
          aria-label="Add custom milestone"
        >
          <h3 className="font-semibold text-[var(--color-text-primary)]">Record a milestone</h3>
          <Input
            label="Milestone"
            id="milestone-title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="e.g. First steps"
            required
          />
          <div>
            <label
              htmlFor="milestone-age-band"
              className="block text-sm font-medium text-[var(--color-text-primary)] mb-1"
            >
              Age band <span aria-hidden="true">*</span>
            </label>
            <select
              id="milestone-age-band"
              value={form.age_band}
              onChange={(e) => setForm((f) => ({ ...f, age_band: e.target.value as AgeBand }))}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-sage)] min-h-[44px]"
            >
              <option value="">Select age band</option>
              {AGE_BANDS.map((band) => (
                <option key={band} value={band}>
                  {AGE_BAND_LABELS[band]}
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Achieved on"
            id="milestone-date"
            type="date"
            value={form.achieved_at}
            onChange={(e) => setForm((f) => ({ ...f, achieved_at: e.target.value }))}
            max={today}
            required
          />
          {formError && (
            <p role="alert" className="text-sm text-red-600">
              {formError}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={submitting}>
              Save
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setAdding(false); setFormError(null); }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Timeline */}
      {customMilestones.length === 0 ? (
        <p className="text-[var(--color-text-secondary)] text-sm">
          No custom milestones recorded yet. Capture your child&apos;s special moments!
        </p>
      ) : (
        <ol className="relative border-l-2 border-[var(--color-sage)] space-y-6 ml-3" aria-label="Milestone timeline">
          {customMilestones.map((m) => (
            <li key={m.id} className="relative pl-6">
              <span
                className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-[var(--color-sage)] border-2 border-white"
                aria-hidden="true"
              />
              <div className="clay-card p-3 flex justify-between items-start gap-2">
                <div>
                  <p className="font-semibold text-[var(--color-text-primary)]">{m.title}</p>
                  <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
                    {m.achieved_at
                      ? new Date(m.achieved_at).toLocaleDateString()
                      : "Date not recorded"}{" "}
                    · {AGE_BAND_LABELS[m.age_band as AgeBand] ?? m.age_band}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="text-xs text-red-400 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`Delete milestone: ${m.title}`}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
