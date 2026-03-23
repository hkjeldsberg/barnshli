import type { AgeBand } from "@/lib/utils/age";

export const MILESTONE_PROMPT_VERSION = "v1";

const AGE_BAND_DESCRIPTIONS: Record<AgeBand, string> = {
  "0-3mo": "0 to 3 months",
  "3-6mo": "3 to 6 months",
  "6-9mo": "6 to 9 months",
  "9-12mo": "9 to 12 months",
  "12-18mo": "12 to 18 months",
  "18-24mo": "18 to 24 months",
  "24-36mo": "2 to 3 years",
  "36-48mo": "3 to 4 years",
  "48-60mo": "4 to 5 years",
};

/**
 * Builds a structured prompt for Claude to generate developmental milestone checklists.
 * Version: v1
 */
export function buildMilestonePrompt(ageBand: AgeBand, sex: "male" | "female"): string {
  const ageDescription = AGE_BAND_DESCRIPTIONS[ageBand];
  const pronoun = sex === "male" ? "he" : "she";
  const possessive = sex === "male" ? "his" : "her";

  return `You are a child development expert generating a developmental milestone checklist for a ${sex} child aged ${ageDescription}.

Generate exactly 10 developmental milestones that are:
1. Grounded in WHO Child Growth Standards and AAP (American Academy of Pediatrics) guidelines
2. Observable and measurable by parents at home
3. Appropriate for a child aged ${ageDescription}
4. Covering multiple domains: motor (gross & fine), language, cognitive, and social-emotional

Format your response as a JSON array of strings only — no explanations, no numbering, no extra text. Each string is one milestone in plain language that a parent can understand and observe.

Example format:
["Reaches for nearby objects", "Responds to own name", "Passes objects between hands"]

Remember: The child is ${sex}. Use gender-neutral language unless specifying sex-typical development. Each milestone should describe what ${pronoun} CAN do, not what ${pronoun} cannot do. Write from a positive, encouraging perspective that a parent checking ${possessive} child's progress would find meaningful.

Respond with ONLY the JSON array.`;
}
