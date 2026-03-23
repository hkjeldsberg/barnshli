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

/** Returns the child's age in whole months as of today. */
export function calculateAgeMonths(dateOfBirth: Date): number {
  const today = new Date();
  const years = today.getFullYear() - dateOfBirth.getFullYear();
  const months = today.getMonth() - dateOfBirth.getMonth();
  const dayAdjustment = today.getDate() < dateOfBirth.getDate() ? -1 : 0;
  return years * 12 + months + dayAdjustment;
}

/** Formats a month count into a human-readable age string. */
export function formatAge(months: number): string {
  if (months < 0) return "Newborn";
  if (months === 0) return "Less than 1 month";
  if (months < 12) return `${months} month${months === 1 ? "" : "s"}`;
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) {
    return `${years} year${years === 1 ? "" : "s"}`;
  }
  return `${years} year${years === 1 ? "" : "s"}, ${remainingMonths} month${remainingMonths === 1 ? "" : "s"}`;
}

/**
 * Returns the WHO age band label for a given number of months.
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
