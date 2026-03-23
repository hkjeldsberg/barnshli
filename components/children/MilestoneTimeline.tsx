"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { Milestone } from "@/lib/db/milestones";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import {
  AGE_BAND_LABELS,
  AGE_BANDS,
  getAgeBand,
  monthsBetween,
  formatDate,
  type AgeBand,
} from "@/lib/utils/age";

interface MilestoneTimelineProps {
  childId: string;
  dateOfBirth: string;
  initialMilestones: Milestone[];
}

// ─── Inline edit cell (same pattern as WordDiary) ────────────────────────────

interface EditCellProps {
  value: string;
  displayValue?: string;
  placeholder?: string;
  type?: "text" | "date";
  className?: string;
  onSave: (val: string) => Promise<void>;
}

function EditCell({ value, displayValue, placeholder, type = "text", className = "", onSave }: EditCellProps): React.JSX.Element {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(value);
  const [saving, setSaving] = useState(false);

  async function commit(): Promise<void> {
    if (draft === value) { setEditing(false); return; }
    setSaving(true);
    await onSave(draft);
    setSaving(false);
    setEditing(false);
  }

  if (editing) {
    return (
      <input
        type={type}
        value={draft}
        autoFocus
        max={type === "date" ? new Date().toISOString().split("T")[0] : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter") void commit();
          if (e.key === "Escape") { setDraft(value); setEditing(false); }
        }}
        disabled={saving}
        className={`rounded-lg border border-sage-400 bg-cream-50 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sage ${className}`}
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`text-left hover:underline transition-colors rounded px-0.5 ${value ? "" : "italic text-slate-400"} ${className}`}
      title="Klikk for å redigere"
    >
      {(displayValue ?? value) || (placeholder ?? "—")}
    </button>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function MilestoneTimeline({
  childId,
  dateOfBirth,
  initialMilestones,
}: MilestoneTimelineProps): React.JSX.Element {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState({ title: "", achieved_at: "" });
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];
  const customMilestones = milestones.filter((m) => m.is_custom);

  /** Compute age band from a date string relative to child's DOB. */
  function computeAgeBand(dateStr: string): AgeBand | null {
    if (!dateStr) return null;
    const months = monthsBetween(new Date(dateOfBirth), new Date(dateStr));
    return getAgeBand(months);
  }

  async function handleAdd(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setFormError(null);
    setSubmitting(true);
    const ageBand = computeAgeBand(form.achieved_at);
    try {
      const res = await fetch(`/api/children/${childId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          achieved_at: form.achieved_at,
          age_band: ageBand ?? AGE_BANDS[AGE_BANDS.length - 1],
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setFormError(data.error ?? "Noe gikk galt");
        return;
      }
      const created = (await res.json()) as Milestone;
      setMilestones((prev) => [created, ...prev]);
      setForm({ title: "", achieved_at: "" });
      setAdding(false);
      router.refresh();
    } catch {
      setFormError("Nettverksfeil. Prøv igjen.");
    } finally {
      setSubmitting(false);
    }
  }

  async function patchMilestone(id: string, data: Record<string, string>): Promise<void> {
    const res = await fetch(`/api/children/${childId}/milestones/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const updated = (await res.json()) as Milestone;
      setMilestones((prev) => prev.map((m) => (m.id === updated.id ? updated : m)));
      router.refresh();
    }
  }

  async function handleDelete(milestoneId: string): Promise<void> {
    await fetch(`/api/children/${childId}/milestones/${milestoneId}`, { method: "DELETE" });
    setMilestones((prev) => prev.filter((m) => m.id !== milestoneId));
    router.refresh();
  }

  return (
    <div className="space-y-6">
      {/* Add button / form */}
      {!adding ? (
        <Button onClick={() => setAdding(true)} size="sm">
          + Legg til milepæl
        </Button>
      ) : (
        <form
          onSubmit={handleAdd}
          className="clay-card p-4 space-y-3"
          aria-label="Legg til milepæl"
        >
          <h3 className="font-semibold text-slate-800">Ny milepæl</h3>
          <Input
            label="Milepæl"
            id="milestone-title"
            value={form.title}
            onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
            placeholder="f.eks. Første skritt"
            required
          />
          <div>
            <label htmlFor="milestone-date" className="block text-sm font-medium text-slate-700 mb-1">
              Oppnådd dato <span aria-hidden="true">*</span>
            </label>
            <input
              id="milestone-date"
              type="date"
              value={form.achieved_at}
              onChange={(e) => setForm((f) => ({ ...f, achieved_at: e.target.value }))}
              max={today}
              required
              className="w-full border border-cream-200 rounded-lg px-3 py-2 text-sm bg-cream-50 focus:outline-none focus:ring-2 focus:ring-sage min-h-[44px]"
            />
            {form.achieved_at && (
              <p className="text-xs text-slate-400 mt-1">
                Aldersgruppe:{" "}
                <span className="font-medium text-sage-600">
                  {(() => {
                    const band = computeAgeBand(form.achieved_at);
                    return band ? AGE_BAND_LABELS[band] : "Utenfor 0–5 år";
                  })()}
                </span>
              </p>
            )}
          </div>
          {formError && (
            <p role="alert" className="text-sm text-dusty-rose-700">{formError}</p>
          )}
          <div className="flex gap-2">
            <Button type="submit" size="sm" loading={submitting}>Lagre</Button>
            <Button type="button" variant="ghost" size="sm" onClick={() => { setAdding(false); setFormError(null); }}>
              Avbryt
            </Button>
          </div>
        </form>
      )}

      {/* Timeline */}
      {customMilestones.length === 0 ? (
        <p className="text-slate-500 text-sm">
          Ingen milepæler registrert ennå. Fang barnets spesielle øyeblikk!
        </p>
      ) : (
        <ol
          className="relative border-l-2 border-sage space-y-6 ml-3"
          aria-label="Milepæler"
        >
          {customMilestones.map((m) => (
            <li key={m.id} className="relative pl-6 group">
              <span
                className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-sage border-2 border-white"
                aria-hidden="true"
              />
              <div className="clay-card p-3 flex justify-between items-start gap-2">
                <div className="flex-1 min-w-0">
                  <EditCell
                    value={m.title}
                    placeholder="Milepæl…"
                    className="font-semibold text-slate-800"
                    onSave={(v) => patchMilestone(m.id, { title: v })}
                  />
                  <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                    <EditCell
                      value={m.achieved_at ? m.achieved_at.slice(0, 10) : ""}
                      displayValue={m.achieved_at ? formatDate(m.achieved_at) : ""}
                      placeholder="dato"
                      type="date"
                      className="text-xs text-slate-400"
                      onSave={async (v) => {
                        const band = getAgeBand(monthsBetween(new Date(dateOfBirth), new Date(v)));
                        await patchMilestone(m.id, {
                          achieved_at: v,
                          ...(band ? { age_band: band } : {}),
                        });
                      }}
                    />
                    {m.age_band && (
                      <span className="text-xs bg-sage-100 text-sage-600 px-1.5 py-0.5 rounded-full">
                        {AGE_BAND_LABELS[m.age_band as AgeBand] ?? m.age_band}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => handleDelete(m.id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-dusty-rose-700 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`Slett milepæl: ${m.title}`}
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
