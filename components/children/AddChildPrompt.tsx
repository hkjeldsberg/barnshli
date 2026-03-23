import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function AddChildPrompt(): React.JSX.Element {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center gap-4">
      <div className="text-5xl" aria-hidden="true">
        🌱
      </div>
      <h2 className="font-display text-xl font-bold text-slate-800">
        Add your first child
      </h2>
      <p className="text-sm text-slate-500 max-w-xs">
        Start tracking milestones, growth, and words. It only takes a moment.
      </p>
      <Link href="/onboarding">
        <Button>Add a child</Button>
      </Link>
    </div>
  );
}
