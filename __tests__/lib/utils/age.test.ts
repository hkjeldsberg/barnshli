import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  calculateAgeMonths,
  formatAge,
  getAgeBand,
  AGE_BANDS,
} from "@/lib/utils/age";

describe("calculateAgeMonths", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-03-23"));
  });

  it("returns 0 for a newborn (same day)", () => {
    expect(calculateAgeMonths(new Date("2026-03-23"))).toBe(0);
  });

  it("returns correct months for a 6-month-old", () => {
    expect(calculateAgeMonths(new Date("2025-09-23"))).toBe(6);
  });

  it("returns correct months for a 12-month-old", () => {
    expect(calculateAgeMonths(new Date("2025-03-23"))).toBe(12);
  });

  it("adjusts for day-of-month (birthday not yet reached this month)", () => {
    expect(calculateAgeMonths(new Date("2025-09-30"))).toBe(5);
  });

  it("returns negative for a future date", () => {
    expect(calculateAgeMonths(new Date("2026-04-01"))).toBeLessThan(0);
  });
});

describe("formatAge", () => {
  it("returns 'Nyfødt' for negative months", () => {
    expect(formatAge(-1)).toBe("Nyfødt");
  });

  it("returns 'Mindre enn 1 måned' for 0 months", () => {
    expect(formatAge(0)).toBe("Mindre enn 1 måned");
  });

  it("returns singular 'måned' for 1 month", () => {
    expect(formatAge(1)).toBe("1 måned");
  });

  it("returns plural 'måneder' for 2–11 months", () => {
    expect(formatAge(6)).toBe("6 måneder");
    expect(formatAge(11)).toBe("11 måneder");
  });

  it("returns '1 år' exactly at 12 months", () => {
    expect(formatAge(12)).toBe("1 år");
  });

  it("returns plural years at 24 months", () => {
    expect(formatAge(24)).toBe("2 år");
  });

  it("returns years and months when remainder exists", () => {
    expect(formatAge(13)).toBe("1 år og 1 måned");
    expect(formatAge(14)).toBe("1 år og 2 måneder");
    expect(formatAge(25)).toBe("2 år og 1 måned");
  });
});

describe("getAgeBand", () => {
  it("returns null for negative months", () => {
    expect(getAgeBand(-1)).toBeNull();
  });

  it("returns null for 60+ months", () => {
    expect(getAgeBand(60)).toBeNull();
    expect(getAgeBand(72)).toBeNull();
  });

  it("maps months 0-2 to 0-3mo", () => {
    expect(getAgeBand(0)).toBe("0-3mo");
    expect(getAgeBand(2)).toBe("0-3mo");
  });

  it("maps months 3-5 to 3-6mo", () => {
    expect(getAgeBand(3)).toBe("3-6mo");
    expect(getAgeBand(5)).toBe("3-6mo");
  });

  it("maps month 12-17 to 12-18mo", () => {
    expect(getAgeBand(12)).toBe("12-18mo");
    expect(getAgeBand(17)).toBe("12-18mo");
  });

  it("maps month 48-59 to 48-60mo", () => {
    expect(getAgeBand(48)).toBe("48-60mo");
    expect(getAgeBand(59)).toBe("48-60mo");
  });
});

describe("AGE_BANDS", () => {
  it("contains 9 bands", () => {
    expect(AGE_BANDS).toHaveLength(9);
  });

  it("starts with 0-3mo and ends with 48-60mo", () => {
    expect(AGE_BANDS[0]).toBe("0-3mo");
    expect(AGE_BANDS[AGE_BANDS.length - 1]).toBe("48-60mo");
  });
});
