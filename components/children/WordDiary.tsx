"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { WordEntryWithVariants, WordVariant } from "@/lib/db/words";
import { Button } from "@/components/ui/Button";
import { formatDate } from "@/lib/utils/age";

interface WordDiaryProps {
  childId: string;
  initialEntries: WordEntryWithVariants[];
}

const today = new Date().toISOString().split("T")[0];

const fmt = formatDate;

// ─── Inline editable cell ────────────────────────────────────────────────────

interface EditCellProps {
  value: string;
  displayValue?: string;
  placeholder: string;
  type?: "text" | "date";
  onSave: (val: string) => Promise<void>;
  className?: string;
}

function EditCell({ value, displayValue, placeholder, type = "text", onSave, className = "" }: EditCellProps): React.JSX.Element {
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
        max={type === "date" ? today : undefined}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => { if (e.key === "Enter") void commit(); if (e.key === "Escape") { setDraft(value); setEditing(false); } }}
        className={`rounded-lg border border-sage-400 bg-cream-50 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sage ${className}`}
        aria-label="Edit value"
        disabled={saving}
      />
    );
  }

  return (
    <button
      onClick={() => { setDraft(value); setEditing(true); }}
      className={`text-left text-sm hover:underline hover:text-slate-900 transition-colors rounded px-0.5 ${value ? "text-slate-800" : "text-slate-400 italic"} ${className}`}
      title="Klikk for å redigere"
    >
      {(displayValue ?? value) || placeholder}
    </button>
  );
}

// ─── Variant timeline ─────────────────────────────────────────────────────────

interface VariantTimelineProps {
  variants: WordVariant[];
  wordId: string;
  childId: string;
  onAdded: () => Promise<void>;
}

function VariantTimeline({ variants, wordId, childId, onAdded }: VariantTimelineProps): React.JSX.Element {
  const [adding, setAdding] = useState(false);
  const [text, setText] = useState("");
  const [date, setDate] = useState(today);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleAdd(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setSaving(true);
    setError(null);
    const res = await fetch(`/api/children/${childId}/words/${wordId}/variants`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ variant: text, recorded_at: date }),
    });
    if (!res.ok) {
      const d = await res.json().catch(() => ({})) as { error?: string };
      setError(d.error ?? "Failed to add");
    } else {
      setText("");
      setDate(today);
      setAdding(false);
      await onAdded();
    }
    setSaving(false);
  }

  return (
    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
      {variants.map((v, i) => (
        <React.Fragment key={v.id}>
          {i > 0 && (
            <span className="text-slate-300 text-sm select-none" aria-hidden="true">→</span>
          )}
          <span className="inline-flex flex-col items-center">
            <span className="bg-sky-blue-100 text-slate-700 text-sm px-2.5 py-0.5 rounded-full font-medium">
              {v.variant}
            </span>
            <EditCell
              value={v.recorded_at.slice(0, 10)}
              displayValue={fmt(v.recorded_at)}
              placeholder="dato"
              type="date"
              className="text-[10px] text-slate-400 mt-0.5"
              onSave={async (newDate) => {
                await fetch(`/api/children/${childId}/words/${wordId}/variants/${v.id}`, {
                  method: "PATCH",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ recorded_at: newDate }),
                });
                await onAdded();
              }}
            />
          </span>
        </React.Fragment>
      ))}

      {/* Add variant */}
      {variants.length > 0 && (
        <span className="text-slate-300 text-sm select-none" aria-hidden="true">→</span>
      )}

      {adding ? (
        <form onSubmit={handleAdd} className="flex items-center gap-1.5">
          <input
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="how they say it"
            required
            autoFocus
            className="w-28 rounded-lg border border-sage-400 bg-cream-50 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
          />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            max={today}
            required
            className="w-34 rounded-lg border border-sage-400 bg-cream-50 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
          />
          <button
            type="submit"
            disabled={saving}
            className="text-xs font-semibold text-sage-600 hover:text-sage-700 px-2 py-1 min-h-[32px]"
          >
            {saving ? "…" : "Add"}
          </button>
          <button
            type="button"
            onClick={() => { setAdding(false); setError(null); }}
            className="text-xs text-slate-400 hover:text-slate-600 px-1 py-1 min-h-[32px]"
          >
            ✕
          </button>
          {error && <span className="text-xs text-dusty-rose-700">{error}</span>}
        </form>
      ) : (
        <button
          onClick={() => setAdding(true)}
          className="text-sm px-2.5 py-0.5 rounded-full border border-dashed border-sage-400 text-sage-600 hover:bg-sage-100 transition-colors"
          aria-label="Add variant"
          title="Add how they say it"
        >
          +
        </button>
      )}
    </div>
  );
}

// ─── Word row ─────────────────────────────────────────────────────────────────

interface WordRowProps {
  entry: WordEntryWithVariants;
  childId: string;
  onDelete: (id: string) => void;
  onUpdate: () => Promise<void>;
}

function WordRow({ entry, childId, onDelete, onUpdate }: WordRowProps): React.JSX.Element {
  async function patchEntry(patch: Record<string, string | null>): Promise<void> {
    await fetch(`/api/children/${childId}/words/${entry.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    await onUpdate();
  }

  return (
    <tr className="group border-b border-cream-200 hover:bg-cream-50 transition-colors">
      {/* Base word */}
      <td className="py-3 px-3 align-top w-32">
        <EditCell
          value={entry.base_word}
          placeholder="word"
          onSave={(v) => patchEntry({ base_word: v })}
          className="font-semibold text-slate-800"
        />
        <div className="mt-0.5">
          <EditCell
            value={entry.first_heard_at.slice(0, 10)}
            displayValue={fmt(entry.first_heard_at)}
            placeholder="dato"
            type="date"
            onSave={(v) => patchEntry({ first_heard_at: v })}
            className="text-xs text-slate-400"
          />
        </div>
      </td>

      {/* Real word */}
      <td className="py-3 px-3 align-top w-32">
        <EditCell
          value={entry.real_word ?? ""}
          placeholder="real word…"
          onSave={(v) => patchEntry({ real_word: v })}
          className="text-slate-600"
        />
      </td>

      {/* Variants timeline */}
      <td className="py-3 px-3 align-middle">
        <VariantTimeline
          variants={entry.variants}
          wordId={entry.id}
          childId={childId}
          onAdded={onUpdate}
        />
      </td>

      {/* Delete */}
      <td className="py-3 px-2 align-top w-8">
        <button
          onClick={() => onDelete(entry.id)}
          className="opacity-0 group-hover:opacity-100 transition-opacity text-slate-300 hover:text-dusty-rose-700 text-lg min-h-[32px] min-w-[32px] flex items-center justify-center"
          aria-label={`Delete ${entry.base_word}`}
        >
          ✕
        </button>
      </td>
    </tr>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function WordDiary({ childId, initialEntries }: WordDiaryProps): React.JSX.Element {
  const router = useRouter();
  const [entries, setEntries] = useState<WordEntryWithVariants[]>(initialEntries);
  const [addingWord, setAddingWord] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newRealWord, setNewRealWord] = useState("");
  const [newWordDate, setNewWordDate] = useState(today);
  const [wordError, setWordError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function refresh(): Promise<void> {
    const res = await fetch(`/api/children/${childId}/words`);
    if (res.ok) {
      const data = (await res.json()) as WordEntryWithVariants[];
      setEntries(data);
    }
    router.refresh();
  }

  async function handleAddWord(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setWordError(null);
    setSubmitting(true);
    const res = await fetch(`/api/children/${childId}/words`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        base_word: newWord,
        first_heard_at: newWordDate,
        real_word: newRealWord || null,
      }),
    });
    if (!res.ok) {
      const data = (await res.json()) as { error?: string };
      setWordError(data.error ?? "Failed to add word");
    } else {
      setNewWord("");
      setNewRealWord("");
      setNewWordDate(today);
      setAddingWord(false);
      await refresh();
    }
    setSubmitting(false);
  }

  async function handleDelete(wordId: string): Promise<void> {
    await fetch(`/api/children/${childId}/words/${wordId}`, { method: "DELETE" });
    setEntries((prev) => prev.filter((e) => e.id !== wordId));
    router.refresh();
  }

  return (
    <div className="space-y-4">
      {/* Add word form */}
      {addingWord ? (
        <form
          onSubmit={handleAddWord}
          className="clay-card-sm p-4 flex flex-wrap gap-3 items-end"
          aria-label="Add new word"
        >
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="nw-word">
              Ord (slik barnet sier det)
            </label>
            <input
              id="nw-word"
              value={newWord}
              onChange={(e) => setNewWord(e.target.value)}
              placeholder="f.eks. mama"
              required
              className="w-32 rounded-xl border border-cream-200 bg-cream-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="nw-real">
              Ekte ord (valgfritt)
            </label>
            <input
              id="nw-real"
              value={newRealWord}
              onChange={(e) => setNewRealWord(e.target.value)}
              placeholder="f.eks. mor"
              className="w-32 rounded-xl border border-cream-200 bg-cream-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1" htmlFor="nw-date">
              Første gang hørt
            </label>
            <input
              id="nw-date"
              type="date"
              value={newWordDate}
              onChange={(e) => setNewWordDate(e.target.value)}
              max={today}
              required
              className="rounded-xl border border-cream-200 bg-cream-50 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-sage"
            />
          </div>
          <div className="flex gap-2 items-center">
            <Button type="submit" size="sm" loading={submitting}>
              Lagre
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => { setAddingWord(false); setWordError(null); }}
            >
              Avbryt
            </Button>
          </div>
          {wordError && (
            <p role="alert" className="w-full text-xs text-dusty-rose-700">{wordError}</p>
          )}
        </form>
      ) : (
        <Button size="sm" onClick={() => setAddingWord(true)}>
          + Legg til ord
        </Button>
      )}

      {/* Table */}
      {entries.length === 0 ? (
        <p className="text-sm text-slate-400">
          Ingen ord registrert ennå. Legg til det første ordet barnet sa!
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b-2 border-cream-200 text-left">
                <th className="pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">
                  Ord
                </th>
                <th className="pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider w-32">
                  Ekte ord
                </th>
                <th className="pb-2 px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Uttale-tidslinje
                </th>
                <th className="pb-2 px-2 w-8" />
              </tr>
            </thead>
            <tbody>
              {entries.map((entry) => (
                <WordRow
                  key={entry.id}
                  entry={entry}
                  childId={childId}
                  onDelete={handleDelete}
                  onUpdate={refresh}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
