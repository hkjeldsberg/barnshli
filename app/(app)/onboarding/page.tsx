import type { Metadata } from "next";
import { OnboardingForm } from "@/components/forms/OnboardingForm";

export const metadata: Metadata = { title: "Welcome" };

export default function OnboardingPage(): React.JSX.Element {
  return (
    <div className="min-h-screen flex items-center justify-center bg-cream px-4 py-12">
      <div className="w-full max-w-md bg-cream-50 rounded-3xl shadow-clay-lg border border-cream-200 p-8 animate-scale-in">
        <OnboardingForm />
      </div>
    </div>
  );
}
