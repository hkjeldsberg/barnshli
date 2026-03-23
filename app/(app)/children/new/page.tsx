import type { Metadata } from "next";
import React from "react";
import { AddChildForm } from "@/components/forms/AddChildForm";

export const metadata: Metadata = { title: "Add child" };

export default function NewChildPage(): React.JSX.Element {
  return (
    <div className="max-w-md mx-auto">
      <h1 className="font-display text-3xl font-extrabold text-slate-800 mb-2">
        Add a child
      </h1>
      <p className="text-sm text-slate-500 mb-8">
        Enter your child&apos;s details to start tracking their growth and milestones.
      </p>
      <div className="clay-card p-6">
        <AddChildForm />
      </div>
    </div>
  );
}
