"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { Milestone } from "@/lib/db/milestones";
import type { AgeBand } from "@/lib/utils/age";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input } from "@/components/ui/Input";

interface AIChecklistProps {
  childId: string;
  ageBand: AgeBand;
  initialMilestones: Milestone[];
  initialChallenges: Milestone[];
}

export function AIChecklist({
  childId,
  ageBand,
  initialMilestones,
  initialChallenges,
}: AIChecklistProps): React.JSX.Element {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [challenges, setChallenges] = useState<Milestone[]>(initialChallenges);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  // Extra challenge form state
  const [addingChallenge, setAddingChallenge] = useState(false);
  const [challengeTitle, setChallengeTitle] = useState("");
  const [addingChallengeLoading, setAddingChallengeLoading] = useState(false);
  const [challengeError, setChallengeError] = useState<string | null>(null);

  async function handleGenerate(): Promise<void> {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/children/${childId}/milestones/ai-generate`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Kunne ikke generere sjekkliste");
        return;
      }
      const data = (await res.json()) as Milestone[];
      setMilestones(data);
      router.refresh();
    } catch {
      setError("Nettverksfeil. Prøv igjen.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggle(
    milestone: Milestone,
    listSetter: React.Dispatch<React.SetStateAction<Milestone[]>>,
  ): Promise<void> {
    setTogglingIds((prev) => new Set(prev).add(milestone.id));
    try {
      const res = await fetch(
        `/api/children/${childId}/milestones/${milestone.id}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ completed: !milestone.completed }),
        },
      );
      if (res.ok) {
        const updated = (await res.json()) as Milestone;
        listSetter((prev) =>
          prev.map((m) => (m.id === updated.id ? updated : m)),
        );
        router.refresh();
      }
    } finally {
      setTogglingIds((prev) => {
        const next = new Set(prev);
        next.delete(milestone.id);
        return next;
      });
    }
  }

  async function handleAddChallenge(
    e: React.FormEvent,
  ): Promise<void> {
    e.preventDefault();
    setChallengeError(null);
    setAddingChallengeLoading(true);
    try {
      const res = await fetch(`/api/children/${childId}/milestones`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: challengeTitle,
          age_band: ageBand,
          type: "challenge",
        }),
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setChallengeError(data.error ?? "Noe gikk galt");
        return;
      }
      const created = (await res.json()) as Milestone;
      setChallenges((prev) => [...prev, created]);
      setChallengeTitle("");
      setAddingChallenge(false);
      router.refresh();
    } catch {
      setChallengeError("Nettverksfeil. Prøv igjen.");
    } finally {
      setAddingChallengeLoading(false);
    }
  }

  const completedCount = milestones.filter((m) => m.completed).length;

  if (milestones.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Ingen AI-sjekkliste generert ennå for aldersgruppen{" "}
          <strong>{ageBand}</strong>.
        </p>
        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}
        <Button onClick={handleGenerate} loading={generating} size="sm">
          Generer AI-sjekkliste
        </Button>
        <p className="text-xs text-[var(--color-text-secondary)]">
          Drevet av Claude AI · Basert på WHO &amp; AAP retningslinjer
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress summary */}
      <div className="flex items-center gap-3">
        <div
          className="flex-1 bg-gray-200 rounded-full h-2"
          role="progressbar"
          aria-valuenow={completedCount}
          aria-valuemin={0}
          aria-valuemax={milestones.length}
          aria-label={`${completedCount} av ${milestones.length} milepæler fullført`}
        >
          <div
            className="bg-[var(--color-sage)] h-2 rounded-full transition-all duration-300"
            style={{ width: `${(completedCount / milestones.length) * 100}%` }}
          />
        </div>
        <span className="text-sm font-medium text-[var(--color-text-primary)]">
          {completedCount}/{milestones.length}
        </span>
      </div>

      {/* Source badge */}
      <div className="flex items-center gap-2">
        <Badge variant="aap" label="WHO & AAP" />
        <span className="text-xs text-[var(--color-text-secondary)]">
          AI-generert · {ageBand}
        </span>
      </div>

      {/* AI checklist */}
      <ul className="space-y-2" aria-label="AI utviklingssjekkliste">
        {milestones.map((m) => (
          <li key={m.id} className="flex items-start gap-3">
            <button
              onClick={() => handleToggle(m, setMilestones)}
              disabled={togglingIds.has(m.id)}
              className={`
                mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center
                transition-colors min-h-[44px] min-w-[44px]
                ${m.completed
                  ? "bg-[var(--color-sage)] border-[var(--color-sage)] text-white"
                  : "border-gray-300 hover:border-[var(--color-sage)]"
                }
              `}
              aria-label={
                m.completed
                  ? `Merk "${m.title}" som ikke fullført`
                  : `Merk "${m.title}" som fullført`
              }
              aria-pressed={m.completed}
            >
              {m.completed && (
                <svg
                  className="w-3 h-3"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                  aria-hidden="true"
                >
                  <path
                    fillRule="evenodd"
                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </button>
            <span
              className={`text-sm leading-relaxed ${
                m.completed
                  ? "line-through text-[var(--color-text-secondary)]"
                  : "text-[var(--color-text-primary)]"
              }`}
            >
              {m.title}
            </span>
          </li>
        ))}
      </ul>

      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}

      {/* Extra challenges section */}
      <div className="border-t border-cream-200 pt-5 space-y-3">
        <div>
          <h3 className="text-base font-semibold text-[var(--color-text-primary)]">
            Ekstra utfordringer
          </h3>
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            Legg til egne utfordringer når alle milepæler er nådd, eller for
            å stimulere videre utvikling.
          </p>
        </div>

        {challenges.length > 0 && (
          <ul className="space-y-2" aria-label="Ekstra utfordringer">
            {challenges.map((c) => (
              <li key={c.id} className="flex items-start gap-3">
                <button
                  onClick={() => handleToggle(c, setChallenges)}
                  disabled={togglingIds.has(c.id)}
                  className={`
                    mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center
                    transition-colors min-h-[44px] min-w-[44px]
                    ${c.completed
                      ? "bg-[var(--color-peach)] border-[var(--color-peach)] text-white"
                      : "border-gray-300 hover:border-[var(--color-peach)]"
                    }
                  `}
                  aria-label={
                    c.completed
                      ? `Merk "${c.title}" som ikke fullført`
                      : `Merk "${c.title}" som fullført`
                  }
                  aria-pressed={c.completed}
                >
                  {c.completed && (
                    <svg
                      className="w-3 h-3"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
                <span
                  className={`text-sm leading-relaxed ${
                    c.completed
                      ? "line-through text-[var(--color-text-secondary)]"
                      : "text-[var(--color-text-primary)]"
                  }`}
                >
                  {c.title}
                </span>
              </li>
            ))}
          </ul>
        )}

        {!addingChallenge ? (
          <Button
            onClick={() => setAddingChallenge(true)}
            variant="ghost"
            size="sm"
          >
            + Legg til ekstra utfordring
          </Button>
        ) : (
          <form
            onSubmit={handleAddChallenge}
            className="space-y-3 clay-card p-4"
            aria-label="Legg til ekstra utfordring"
          >
            <Input
              id="challenge-title"
              label="Utfordring"
              value={challengeTitle}
              onChange={(e) => setChallengeTitle(e.target.value)}
              placeholder="f.eks. Klatre opp trappa alene"
              required
            />
            {challengeError && (
              <p role="alert" className="text-sm text-dusty-rose-700">
                {challengeError}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="submit" size="sm" loading={addingChallengeLoading}>
                Lagre
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setAddingChallenge(false);
                  setChallengeTitle("");
                  setChallengeError(null);
                }}
              >
                Avbryt
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
