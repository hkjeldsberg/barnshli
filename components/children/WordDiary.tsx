"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { WordEntryWithVariants } from "@/lib/db/words";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

interface WordDiaryProps {
  childId: string;
  initialEntries: WordEntryWithVariants[];
}

export function WordDiary({ childId, initialEntries }: WordDiaryProps): React.JSX.Element {
  const router = useRouter();
  const [entries, setEntries] = useState<WordEntryWithVariants[]>(initialEntries);
  const [addingWord, setAddingWord] = useState(false);
  const [newWord, setNewWord] = useState("");
  const [newWordDate, setNewWordDate] = useState("");
  const [wordError, setWordError] = useState<string | null>(null);
  const [variantForms, setVariantForms] = useState<Record<string, boolean>>({});
  const [variantInputs, setVariantInputs] = useState<Record<string, { text: string; date: string }>>({});
  const [variantErrors, setVariantErrors] = useState<Record<string, string | null>>({});
  const [submitting, setSubmitting] = useState(false);

  const today = new Date().toISOString().split("T")[0];

  async function handleAddWord(e: React.FormEvent): Promise<void> {
    e.preventDefault();
    setWordError(null);
    setSubmitting(true);
    try {
      const res = await fetch(`/api/children/${childId}/words`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base_word: newWord, first_heard_at: newWordDate }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setWordError(data.error ?? "Failed to add word");
        return;
      }
      setNewWord("");
      setNewWordDate("");
      setAddingWord(false);
      router.refresh();
      const updated = await fetch(`/api/children/${childId}/words`);
      if (updated.ok) {
        const data = (await updated.json()) as WordEntryWithVariants[];
        setEntries(data);
      }
    } catch {
      setWordError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDeleteWord(wordId: string): Promise<void> {
    try {
      await fetch(`/api/children/${childId}/words/${wordId}`, { method: "DELETE" });
      setEntries((prev) => prev.filter((e) => e.id !== wordId));
      router.refresh();
    } catch {
      // silent
    }
  }

  function toggleVariantForm(wordId: string): void {
    setVariantForms((prev) => ({ ...prev, [wordId]: !prev[wordId] }));
    if (!variantInputs[wordId]) {
      setVariantInputs((prev) => ({ ...prev, [wordId]: { text: "", date: today } }));
    }
  }

  async function handleAddVariant(e: React.FormEvent, wordId: string): Promise<void> {
    e.preventDefault();
    setVariantErrors((prev) => ({ ...prev, [wordId]: null }));
    setSubmitting(true);
    const input = variantInputs[wordId] ?? { text: "", date: today };
    try {
      const res = await fetch(`/api/children/${childId}/words/${wordId}/variants`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ variant: input.text, recorded_at: input.date }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setVariantErrors((prev) => ({ ...prev, [wordId]: data.error ?? "Failed to add variant" }));
        return;
      }
      setVariantInputs((prev) => ({ ...prev, [wordId]: { text: "", date: today } }));
      setVariantForms((prev) => ({ ...prev, [wordId]: false }));
      const updated = await fetch(`/api/children/${childId}/words`);
      if (updated.ok) {
        const data = (await updated.json()) as WordEntryWithVariants[];
        setEntries(data);
      }
      router.refresh();
    } catch {
      setVariantErrors((prev) => ({ ...prev, [wordId]: "Network error. Please try again." }));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Add word button / form */}
      {!addingWord ? (
        <Button onClick={() => setAddingWord(true)} size="sm">
          + Add Word
        </Button>
      ) : (
        <form
          onSubmit={handleAddWord}
          className="clay-card p-4 space-y-3 bg-[var(--color-cream)]"
          aria-label="Add new word"
        >
          <h3 className="font-semibold text-[var(--color-text-primary)]">Add a new word</h3>
          <Input
            label="Word"
            id="new-word"
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="e.g. mama"
            required
          />
          <Input
            label="First heard"
            id="new-word-date"
            type="date"
            value={newWordDate}
            onChange={(e) => setNewWordDate(e.target.value)}
            max={today}
            required
          />
          {wordError && (
            <p role="alert" className="text-sm text-red-600">
              {wordError}
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
              onClick={() => { setAddingWord(false); setWordError(null); }}
            >
              Cancel
            </Button>
          </div>
        </form>
      )}

      {/* Word list */}
      {entries.length === 0 ? (
        <p className="text-[var(--color-text-secondary)] text-sm">
          No words recorded yet. Add the first word your child said!
        </p>
      ) : (
        <ul className="space-y-4" aria-label="Word diary">
          {entries.map((entry) => (
            <li key={entry.id} className="clay-card p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <h3 className="font-bold text-lg text-[var(--color-text-primary)]">
                    {entry.base_word}
                  </h3>
                  <p className="text-xs text-[var(--color-text-secondary)] mb-2">
                    First heard:{" "}
                    <time dateTime={entry.first_heard_at}>
                      {new Date(entry.first_heard_at).toLocaleDateString()}
                    </time>
                  </p>

                  {/* Variants */}
                  {entry.variants.length > 0 && (
                    <div className="flex flex-wrap gap-1 items-center mb-2" aria-label="Pronunciation variants">
                      {entry.variants.map((v, i) => (
                        <React.Fragment key={v.id}>
                          {i > 0 && <span aria-hidden="true" className="text-[var(--color-text-secondary)]">→</span>}
                          <span
                            className="inline-flex flex-col items-center"
                            title={`Recorded ${new Date(v.recorded_at).toLocaleDateString()}`}
                          >
                            <span className="bg-[var(--color-sky-blue)] text-[var(--color-text-primary)] text-sm px-2 py-0.5 rounded-full">
                              {v.variant}
                            </span>
                            <span className="text-[10px] text-[var(--color-text-secondary)]">
                              {new Date(v.recorded_at).toLocaleDateString()}
                            </span>
                          </span>
                        </React.Fragment>
                      ))}
                    </div>
                  )}

                  {/* Add variant form */}
                  {variantForms[entry.id] ? (
                    <form
                      onSubmit={(e) => handleAddVariant(e, entry.id)}
                      className="mt-2 space-y-2"
                      aria-label={`Add variant for ${entry.base_word}`}
                    >
                      <Input
                        label="Variant pronunciation"
                        id={`variant-text-${entry.id}`}
                        value={variantInputs[entry.id]?.text ?? ""}
                        onChange={(e) =>
                          setVariantInputs((prev) => ({
                            ...prev,
                            [entry.id]: { ...prev[entry.id], text: e.target.value },
                          }))
                        }
                        placeholder="e.g. dada"
                        required
                      />
                      <Input
                        label="Recorded on"
                        id={`variant-date-${entry.id}`}
                        type="date"
                        value={variantInputs[entry.id]?.date ?? today}
                        onChange={(e) =>
                          setVariantInputs((prev) => ({
                            ...prev,
                            [entry.id]: { ...prev[entry.id], date: e.target.value },
                          }))
                        }
                        max={today}
                        required
                      />
                      {variantErrors[entry.id] && (
                        <p role="alert" className="text-sm text-red-600">
                          {variantErrors[entry.id]}
                        </p>
                      )}
                      <div className="flex gap-2">
                        <Button type="submit" size="sm" loading={submitting}>
                          Add
                        </Button>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleVariantForm(entry.id)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  ) : (
                    <button
                      onClick={() => toggleVariantForm(entry.id)}
                      className="text-xs text-[var(--color-sage)] underline min-h-[44px] min-w-[44px] text-left"
                      aria-label={`Add variant for ${entry.base_word}`}
                    >
                      + Add variant
                    </button>
                  )}
                </div>

                <button
                  onClick={() => handleDeleteWord(entry.id)}
                  className="text-xs text-red-400 hover:text-red-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                  aria-label={`Delete word ${entry.base_word}`}
                >
                  ✕
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
