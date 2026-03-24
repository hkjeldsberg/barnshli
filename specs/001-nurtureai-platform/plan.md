# Implementation Plan: Barnshli — Child Development Platform

**Branch**: `001-nurtureai-platform` | **Date**: 2026-03-23 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-nurtureai-platform/spec.md`

## Summary

Barnshli is a full-stack Next.js web application for tech-savvy parents to track
early childhood development (ages 0–5). It combines growth monitoring with WHO
reference curves, a word diary, custom milestone logging, and AI-generated
developmental checklists powered by Claude Sonnet. All data is stored in Supabase
Postgres behind Supabase Auth, deployed on Vercel.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode), Node.js 20+
**Primary Dependencies**: Next.js 15 (App Router), Tailwind CSS v4, Supabase JS v2,
  Anthropic SDK v0.x, Recharts (growth charts — client-only, lazy-loaded)
**Storage**: Supabase Postgres (all structured data); Supabase Storage (reserved for
  future media; not used in this release)
**Testing**: Vitest (unit/integration); Playwright (E2E, optional — only if explicitly
  requested per constitution)
**Target Platform**: Web (responsive, mobile-first 375 px → 1440 px+), deployed on
  Vercel (preview on PRs, production on `main`)
**Project Type**: Web application (Next.js full-stack, monorepo-free single project)
**Performance Goals**: AI checklist generation ≤ 5 s; growth measurement save + chart
  update ≤ 10 s; login → dashboard ≤ 30 s; initial page load < 2 s (LCP)
**Constraints**: WCAG 2.1 AA (≥ 4.5:1 contrast); GDPR right-to-erasure; children's
  data never sent to third parties; all secrets in `.env.local` (gitignored)
**Scale/Scope**: Initial launch; ~10 k MAU target; 7 primary user flows;
  single-region Supabase instance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Gate | Status |
|-----------|------|--------|
| I. Type Safety & Code Quality | TypeScript strict, no `any`, explicit return types, 300-line file cap, Conventional Commits, pnpm (minimal deps) | ✅ PASS |
| II. Performance-First Rendering | Server Components by default; Recharts chart lazy-loaded via `dynamic()` with `ssr: false`; no blocking third-party scripts | ✅ PASS |
| III. Accessibility & Universal Design | Pastel palette tokens verified for ≥ 4.5:1 contrast; all form fields labelled; 44 × 44 px touch targets; 375–1440 px responsive | ✅ PASS |
| IV. Security, Privacy & Child Safety | Supabase Auth exclusively; GDPR deletion endpoint (`DELETE /api/account`); `.env.local` gitignored; children's data not sent to Anthropic for training (API-only, no training data use) | ✅ PASS — Note: Confirm Anthropic API data-use policy covers no-training guarantee for API calls |
| V. Maintainability & Architecture | App Router conventions; `components/`, `lib/`, `lib/db/`, `lib/ai/prompts/`; no business logic in page files; Supabase typed via `supabase gen types` | ✅ PASS |

**Pre-design gate: PASSED.** No violations requiring justification.

*Post-Phase 1 re-check*: No new violations introduced by data model or contract design.
Recharts client component is properly isolated behind `dynamic()` — Principle II upheld.
AI prompts stored in `lib/ai/prompts/milestones.ts` — Principle V upheld.

*Plan update 2026-03-23 (split milestone pages + user challenges + login i18n)*:
- Milestone split into `milestones/ai/` and `milestones/custom/` sub-routes — no new
  files exceed 300 lines; both pages remain Server Components — Principles I & II upheld.
- User-added challenges reuse the existing `milestones` table via `source = 'user'`
  discriminator — no schema migration required; no new third-party dependency — Principle I upheld.
- Login page Norwegian translation is a pure string change in `LoginForm.tsx` and
  `login/page.tsx` metadata — no architectural impact.

## Project Structure

### Documentation (this feature)

```text
specs/001-nurtureai-platform/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── api.md           # Phase 1 output
├── checklists/
│   └── requirements.md  # Spec quality checklist
└── tasks.md             # Phase 2 output (/speckit.tasks — not yet created)
```

### Source Code (repository root)

```text
app/
├── (auth)/
│   ├── login/
│   │   └── page.tsx
│   ├── register/
│   │   └── page.tsx
│   └── reset-password/
│       └── page.tsx
├── (app)/
│   ├── layout.tsx              # Authenticated shell (sidebar / nav)
│   ├── dashboard/
│   │   └── page.tsx            # Children overview cards
│   ├── onboarding/
│   │   └── page.tsx            # Parent + first child profile setup
│   └── children/
│       └── [id]/
│           ├── page.tsx        # Child detail (tabs or sections)
│           ├── growth/
│           │   └── page.tsx    # Growth log + WHO chart
│           ├── words/
│           │   └── page.tsx    # Word diary
│           └── milestones/
│               ├── page.tsx        # Redirect → milestones/ai
│               ├── ai/
│               │   └── page.tsx    # AI checklist + extra challenges
│               └── custom/
│                   └── page.tsx    # Custom milestone timeline
├── api/
│   ├── children/
│   │   ├── route.ts                              # GET (list), POST (create)
│   │   └── [id]/
│   │       ├── route.ts                          # GET, PUT, DELETE
│   │       ├── growth/
│   │       │   └── route.ts                      # GET, POST
│   │       ├── words/
│   │       │   ├── route.ts                      # GET, POST
│   │       │   └── [wordId]/
│   │       │       ├── route.ts                  # DELETE
│   │       │       └── variants/
│   │       │           └── route.ts              # POST
│   │       └── milestones/
│   │           ├── route.ts                      # GET, POST
│   │           ├── ai-generate/
│   │           │   └── route.ts                  # POST (trigger AI gen)
│   │           └── [milestoneId]/
│   │               └── route.ts                  # PATCH (toggle), DELETE
│   └── account/
│       └── route.ts                              # DELETE (GDPR erasure)
├── layout.tsx
└── middleware.ts                                 # Supabase SSR auth guard

components/
├── ui/                   # Button, Input, Card, Badge, Label, etc.
├── forms/                # ChildForm, GrowthForm, WordForm, MilestoneForm
├── charts/               # GrowthChart.tsx (client, lazy-loaded)
└── children/             # ChildCard, ChildHeader, MilestoneTimeline, AIChecklist,
                          # ExtraChallengesSection, MilestoneSubNav, etc.

lib/
├── ai/
│   └── prompts/
│       └── milestones.ts           # Versioned Claude prompt
├── db/
│   ├── profiles.ts
│   ├── children.ts
│   ├── growth.ts
│   ├── words.ts
│   ├── milestones.ts
│   └── who-reference.ts           # Static WHO dataset helpers
├── supabase/
│   ├── client.ts                  # Browser Supabase client
│   ├── server.ts                  # Server Supabase client (cookies)
│   └── middleware.ts              # Session refresh helper
└── utils/
    ├── age.ts                     # Age calculation from date of birth
    └── validation.ts              # Shared validation rules

types/
└── database.ts                    # Output of `supabase gen types typescript`

public/
└── data/
    └── who/
        ├── weight-for-age-boys.json
        ├── weight-for-age-girls.json
        ├── height-for-age-boys.json
        └── height-for-age-girls.json
```

**Structure Decision**: Single Next.js App Router project. No separate backend. All
server-side logic lives in Route Handlers and Server Components. Database access
exclusively via `lib/db/` functions typed with generated Supabase types.

## Testing Strategy

### Framework

- **Vitest** + **React Testing Library** + **`@testing-library/jest-dom`**
- **jsdom** environment; configured in `vitest.config.ts`
- Setup file: `vitest.setup.ts` (imports `@testing-library/jest-dom`)
- Run: `pnpm test` (CI) · `pnpm test:watch` (development)

### Scope

Unit tests cover **pure utility functions** and **presentational components**.
Server Components, API routes, and `lib/db/*` functions (which need a live Supabase
connection) are excluded from unit tests and are validated manually / via integration.

### Test locations

```text
__tests__/
├── lib/
│   └── utils/
│       └── age.test.ts          # calculateAgeMonths, formatAge, getAgeBand, AGE_BANDS
└── components/
    ├── ui/
    │   ├── Badge.test.tsx       # variant classes, label rendering
    │   ├── Button.test.tsx      # loading state, disabled, onClick, variants
    │   └── Card.test.tsx        # variant classes, children, className merging
    └── children/
        ├── ChildCard.test.tsx   # name, age, sex badge, link href, aria-label
        └── ChildHeader.test.tsx # heading, age, badge, tab links, nav landmark
```

### Mocking conventions

- `next/link` is mocked to render a plain `<a>` (jsdom has no Next.js router)
- Time-dependent tests use `vi.useFakeTimers()` / `vi.setSystemTime()`
- No Supabase or fetch mocking; DB layer tests are out-of-scope for unit tests

## Complexity Tracking

> No constitution violations to justify — table omitted.
