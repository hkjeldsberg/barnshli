import type { Metadata } from "next";
import React from "react";
import { AddChildForm } from "@/components/forms/AddChildForm";

export const metadata: Metadata = { title: "Legg til barn" };

export default function NewChildPage(): React.JSX.Element {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-display text-3xl font-extrabold text-slate-800 mb-2">
        Legg til barn
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        Fyll inn barnets informasjon for å begynne å følge vekst og milepæler.
      </p>
      <div className="clay-card p-6">
        <AddChildForm />
      </div>
    </div>
  );
}
