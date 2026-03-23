# Research: Barnshli — Child Development Platform

**Branch**: `001-nurtureai-platform` | **Date**: 2026-03-23
**Phase**: 0 — Technology & Approach Decisions

---

## 1. WHO Reference Data Strategy

**Decision**: Embed static JSON datasets in `public/data/who/` at build time.

**Rationale**: The WHO Child Growth Standards (weight-for-age, height-for-age) for ages
0–60 months are published as static tables. The full dataset for both sexes and both
metrics totals < 200 KB as JSON. Embedding avoids runtime API calls, eliminates
external dependency failure modes, and makes the chart available offline after first
load. Datasets are updated by WHO infrequently (years between revisions); a manual
update process is acceptable.

**Alternatives considered**:
- Real-time WHO API: No public REST API exists for growth standards; would require
  scraping or a third-party intermediary — rejected.
- Embedded TypeScript constants: Harder to update independently of code — rejected
  in favour of JSON files that can be replaced without recompiling.

**Implementation note**: Load WHO data server-side in `lib/db/who-reference.ts` using
`fs.readFileSync` (available in Route Handlers and Server Components) and pass to the
chart component as a prop. The chart itself runs client-side (Recharts).

---

## 2. Growth Chart Library

**Decision**: Recharts (`recharts` npm package).

**Rationale**: Recharts is the de-facto standard for React line charts, well-maintained,
has a small bundle (< 200 KB gzipped for a LineChart), and supports composite charts
(multiple `<Line>` elements on one `<CartesianAxis>`) needed to overlay child data with
WHO percentile curves. It is a Client Component requirement; it MUST be imported via
`next/dynamic` with `ssr: false` to satisfy Constitution Principle II.

**Alternatives considered**:
- Chart.js / react-chartjs-2: Heavier bundle, less ergonomic React API — rejected.
- Nivo: Visually strong but heavier and more complex configuration for this use case —
  rejected.
- D3 directly: Maximum control but high implementation overhead for this feature —
  rejected.

---

## 3. AI Milestone Generation — Caching & Age Band Strategy

**Decision**: Generate per child + age band; persist results to the `milestones` table
(`is_custom = false`); skip generation if records for that age band already exist.

**Age bands** (9 bands covering 0–60 months):

| Band label | Age range |
|------------|-----------|
| `0-3mo`    | 0–3 months |
| `3-6mo`    | 3–6 months |
| `6-9mo`    | 6–9 months |
| `9-12mo`   | 9–12 months |
| `12-18mo`  | 12–18 months |
| `18-24mo`  | 18–24 months |
| `24-36mo`  | 24–36 months |
| `36-48mo`  | 36–48 months |
| `48-60mo`  | 48–60 months |

**Rationale**: On-demand generation on every page load would be slow (LLM latency) and
expensive (API cost). Caching per age band in the database means the Claude API is
called at most once per child per age band transition. The checklist also becomes
editable (parents can check items off). When a child's age crosses a band boundary,
the Route Handler checks for existing records in the new band and generates if absent.

**Alternatives considered**:
- Cache in Redis / Vercel KV: Adds infrastructure dependency without benefit over DB
  storage, and loses the per-child checkbox state — rejected.
- Generate entire 0–60 month checklist at once: Too many tokens; checklist would be
  overwhelming and not age-relevant — rejected.
- No caching (generate every page load): Violates SC-004 (≤ 5 s) and Principle II —
  rejected.

---

## 4. Supabase Auth & Middleware Pattern

**Decision**: Use `@supabase/ssr` package with Next.js `middleware.ts` for session
management. Server Components and Route Handlers use the server-side Supabase client
(cookie-based). The browser client is used only for auth UI interactions.

**Rationale**: The `@supabase/ssr` package is the official Supabase approach for
Next.js App Router. It refreshes tokens automatically in middleware, ensures Server
Components always have an up-to-date session, and avoids exposing tokens in
localStorage. This fully satisfies Constitution Principle IV.

**Row Level Security (RLS)**: All tables (children, growth_records, word_entries,
word_variants, milestones) MUST have RLS policies enforcing `auth.uid() = parent_id`
(or via join for child-owned tables). This is the primary data-isolation mechanism
(FR-024) and provides defence-in-depth beyond application-layer checks.

---

## 5. GDPR Account Deletion

**Decision**: `DELETE /api/account` Route Handler that:
1. Calls `supabase.auth.admin.deleteUser(userId)` (triggers cascade deletion via DB
   foreign keys + RLS).
2. All child data is deleted via cascading foreign key constraints (ON DELETE CASCADE
   on `parent_id` in `children`, and transitively on all child-owned tables).
3. Returns 204 on success; redirects user to the landing page.

**Rationale**: Cascade deletes at the database layer are reliable and do not require
application-layer cleanup loops. The admin API call requires the Supabase service-role
key, which is only accessible server-side (Route Handler) — satisfying Principle IV.

---

## 6. Tailwind CSS Claymorphism Tokens

**Decision**: Define custom Tailwind tokens in `tailwind.config.ts` for the claymorphism
design language:

- `shadow-clay-sm`, `shadow-clay-md`, `shadow-clay-lg`: Multi-layer box shadows with
  offset + blur + colour (e.g. `0 4px 0 0 rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.1)`)
- Colour palette tokens: `cream`, `sage`, `dusty-rose`, `sky-blue`, `peach` as
  Tailwind colour scales.
- Border radius: `rounded-3xl` (24 px) as the base card radius; `rounded-full` for
  avatars and badges.

**Motion**: Use Tailwind's `transition-all duration-150 ease-in-out` for micro-
interactions. Entrance animations via `@keyframes` defined in `globals.css`, applied
with Tailwind's `animate-*` utilities.

---

## 7. Responsive Sidebar Behaviour

**Decision**: Authenticated layout (`app/(app)/layout.tsx`) renders a sidebar that is:
- Visible (inline) on desktop (> 1024 px).
- Hidden and replaced by a bottom navigation bar on mobile (< 640 px).
- Collapsible (icon-only) on tablet (640–1024 px).

Implemented with Tailwind responsive prefixes (`hidden lg:flex`, etc.) — no JavaScript
required for the static hide/show; a React state toggle handles the tablet collapse.

---

## 8. Package Manager & Tooling

**Decision**: `pnpm` (as specified). ESLint with `eslint-config-next`. Prettier with
Tailwind plugin for class sorting. `tsc --noEmit` as a pre-commit type check.

**Commitlint**: Add `@commitlint/config-conventional` + `husky` pre-commit hook to
enforce Conventional Commits (Constitution Principle I).
