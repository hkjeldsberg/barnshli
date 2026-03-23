"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import type { Milestone } from "@/lib/db/milestones";
import type { AgeBand } from "@/lib/utils/age";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

interface AIChecklistProps {
  childId: string;
  ageBand: AgeBand;
  initialMilestones: Milestone[];
}

export function AIChecklist({
  childId,
  ageBand,
  initialMilestones,
}: AIChecklistProps): React.JSX.Element {
  const router = useRouter();
  const [milestones, setMilestones] = useState<Milestone[]>(initialMilestones);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [togglingIds, setTogglingIds] = useState<Set<string>>(new Set());

  async function handleGenerate(): Promise<void> {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(`/api/children/${childId}/milestones/ai-generate`, {
        method: "POST",
      });
      if (!res.ok) {
        const data = (await res.json()) as { error?: string };
        setError(data.error ?? "Failed to generate checklist");
        return;
      }
      const data = (await res.json()) as Milestone[];
      setMilestones(data);
      router.refresh();
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setGenerating(false);
    }
  }

  async function handleToggle(milestone: Milestone): Promise<void> {
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
        setMilestones((prev) =>
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

  const completedCount = milestones.filter((m) => m.completed).length;

  if (milestones.length === 0) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-[var(--color-text-secondary)]">
          Ingen AI-sjekkliste generert ennå for aldersgruppen <strong>{ageBand}</strong>.
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
    <div className="space-y-4">
      {/* Progress summary */}
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2" role="progressbar"
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

      {/* Checklist */}
      <ul className="space-y-2" aria-label="AI developmental checklist">
        {milestones.map((m) => (
          <li key={m.id} className="flex items-start gap-3">
            <button
              onClick={() => handleToggle(m)}
              disabled={togglingIds.has(m.id)}
              className={`
                mt-0.5 w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center
                transition-colors min-h-[44px] min-w-[44px]
                ${m.completed
                  ? "bg-[var(--color-sage)] border-[var(--color-sage)] text-white"
                  : "border-gray-300 hover:border-[var(--color-sage)]"
                }
              `}
              aria-label={m.completed ? `Merk "${m.title}" som ikke fullført` : `Merk "${m.title}" som fullført`}
              aria-pressed={m.completed}
            >
              {m.completed && (
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
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
    </div>
  );
}
