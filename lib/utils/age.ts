export type AgeBand =
  | "0-3mo"
  | "3-6mo"
  | "6-9mo"
  | "9-12mo"
  | "12-18mo"
  | "18-24mo"
  | "24-36mo"
  | "36-48mo"
  | "48-60mo";

export const AGE_BANDS: AgeBand[] = [
  "0-3mo",
  "3-6mo",
  "6-9mo",
  "9-12mo",
  "12-18mo",
  "18-24mo",
  "24-36mo",
  "36-48mo",
  "48-60mo",
];

export const AGE_BAND_LABELS: Record<AgeBand, string> = {
  "0-3mo": "0–3 måneder",
  "3-6mo": "3–6 måneder",
  "6-9mo": "6–9 måneder",
  "9-12mo": "9–12 måneder",
  "12-18mo": "12–18 måneder",
  "18-24mo": "18–24 måneder",
  "24-36mo": "2–3 år",
  "36-48mo": "3–4 år",
  "48-60mo": "4–5 år",
};

/** Returns the child's age in whole months as of today. */
export function calculateAgeMonths(dateOfBirth: Date): number {
  const today = new Date();
  const years = today.getFullYear() - dateOfBirth.getFullYear();
  const months = today.getMonth() - dateOfBirth.getMonth();
  const dayAdjustment = today.getDate() < dateOfBirth.getDate() ? -1 : 0;
  return years * 12 + months + dayAdjustment;
}

/** Age in months between two specific dates (used for milestone age band). */
export function monthsBetween(from: Date, to: Date): number {
  const years = to.getFullYear() - from.getFullYear();
  const months = to.getMonth() - from.getMonth();
  const dayAdjustment = to.getDate() < from.getDate() ? -1 : 0;
  return years * 12 + months + dayAdjustment;
}

/** Formats a month count into a human-readable Norwegian age string. */
export function formatAge(months: number): string {
  if (months < 0) return "Nyfødt";
  if (months === 0) return "Mindre enn 1 måned";
  if (months < 12) return `${months} ${months === 1 ? "måned" : "måneder"}`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years} år`;
  return `${years} år og ${remainingMonths} ${remainingMonths === 1 ? "måned" : "måneder"}`;
}

/**
 * Returns the WHO age band for a given number of months.
 * Returns null if outside the 0–60 month range.
 */
export function getAgeBand(months: number): AgeBand | null {
  if (months < 0 || months >= 60) return null;
  if (months < 3) return "0-3mo";
  if (months < 6) return "3-6mo";
  if (months < 9) return "6-9mo";
  if (months < 12) return "9-12mo";
  if (months < 18) return "12-18mo";
  if (months < 24) return "18-24mo";
  if (months < 36) return "24-36mo";
  if (months < 48) return "36-48mo";
  return "48-60mo";
}

/**
 * Formats a date string (YYYY-MM-DD or ISO) as dd.mm.yyyy.
 * Safe for date-only strings (no timezone shift).
 */
export function formatDate(dateStr: string): string {
  const s = dateStr.slice(0, 10); // YYYY-MM-DD
  const [year, month, day] = s.split("-");
  return `${day}.${month}.${year}`;
}
