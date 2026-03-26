---

description: "Task list for Barnshli — Child Development Platform"
---

# Tasks: Barnshli — Child Development Platform

**Input**: Design documents from `/specs/001-nurtureai-platform/`
**Prerequisites**: plan.md ✅ spec.md ✅ research.md ✅ data-model.md ✅ contracts/api.md ✅

**Schema note**: All Supabase tables live in the `barnshli` schema (not `public`).
Supabase clients MUST be configured with `db: { schema: 'barnshli' }`.
Type generation uses `supabase gen types typescript --schema barnshli`.

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks grouped by user story for independent implementation and delivery.

## Format: `[ID] [P?] [Story?] Description with file path`

- **[P]**: Parallelizable — different files, no incomplete dependencies
- **[Story]**: User story (US1–US7); omitted for Setup / Foundational / Polish phases
- Exact file paths included in every task description

## Path Conventions

Single Next.js project at repository root:
- Pages: `app/(auth)/`, `app/(app)/`
- API: `app/api/`
- Components: `components/ui/`, `components/forms/`, `components/charts/`, `components/children/`
- Business logic: `lib/db/`, `lib/ai/prompts/`, `lib/supabase/`, `lib/utils/`
- Generated types: `types/database.ts`
- DB migrations: `supabase/migrations/`
- WHO reference data: `public/data/who/`

---

## Phase 1: Setup

**Purpose**: Project initialization, tooling, and static assets.

- [x] T001 Initialize Next.js 15 project with TypeScript strict mode using `pnpm create next-app@latest` at repo root (App Router, no src directory, TypeScript, Tailwind, ESLint)
- [x] T002 [P] Configure Tailwind CSS v4 with claymorphism palette tokens (cream, sage, dusty-rose, sky-blue, peach) and multi-layer clay shadow utilities in tailwind.config.ts and app/globals.css
- [x] T003 [P] Add all four WHO Child Growth Standards JSON datasets to public/data/who/ (weight-for-age-boys.json, weight-for-age-girls.json, height-for-age-boys.json, height-for-age-girls.json) with percentile columns for P3, P15, P50, P85, P97
- [x] T004 [P] Configure ESLint (eslint-config-next), Prettier (with tailwind plugin for class sorting), commitlint (@commitlint/config-conventional), and husky pre-commit hook enforcing tsc + lint + commitlint
- [x] T005 Create .env.example documenting NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, SUPABASE_SERVICE_ROLE_KEY, ANTHROPIC_API_KEY, NEXT_PUBLIC_APP_URL with placeholder values and inline comments
- [x] T006 [P] Create app/layout.tsx with root metadata (title "Barnshli", description, viewport), Google Fonts import (warm rounded display + humanist sans), and Tailwind base class on html/body

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Database schema, auth infrastructure, shared utilities, and UI primitives
that EVERY user story depends on.

⚠️ **CRITICAL**: No user story work may begin until this phase is complete.

- [x] T007 Write supabase/migrations/001_create_barnshli_schema.sql: CREATE SCHEMA barnshli; then CREATE TABLE statements for all six tables (barnshli.profiles, barnshli.children, barnshli.growth_records, barnshli.word_entries, barnshli.word_variants, barnshli.milestones) with exact column definitions, types, CHECK constraints, and FK relationships from data-model.md
- [x] T008 Write supabase/migrations/002_rls_policies.sql: ALTER TABLE ... ENABLE ROW LEVEL SECURITY; and CREATE POLICY statements for each barnshli table enforcing parent-ownership (auth.uid() = parent_id or via join on barnshli.children)
- [x] T009 Write supabase/migrations/003_indexes.sql: CREATE INDEX statements for idx_children_parent, idx_growth_records_child_date, idx_milestones_child_custom, idx_word_variants_entry_date on barnshli tables
- [x] T010 Apply all migrations (supabase db push) and generate TypeScript types scoped to barnshli schema: `supabase gen types typescript --schema barnshli > types/database.ts`
- [x] T011 Create lib/supabase/client.ts: browser-side Supabase client using createBrowserClient from @supabase/ssr with db: { schema: 'barnshli' } option and NEXT_PUBLIC_ env vars
- [x] T012 [P] Create lib/supabase/server.ts: server-side Supabase client using createServerClient from @supabase/ssr with cookie adapter for Server Components and Route Handlers, db: { schema: 'barnshli' }
- [x] T013 Create app/middleware.ts: Supabase SSR session refresh middleware using updateSession from lib/supabase/middleware.ts; protect all routes under /dashboard, /onboarding, /children, /api (except /api/auth/*); redirect unauthenticated users to /login
- [x] T014 Create lib/supabase/middleware.ts: createServerClient with cookie read/write adapter for use in app/middleware.ts session refresh
- [x] T015 [P] Create lib/utils/age.ts: calculateAgeMonths(dateOfBirth: Date): number, formatAge(months: number): string (e.g. "1 year 4 months"), getAgeBand(months: number): string (returns one of the 9 band labels from data-model.md), all with explicit return types
- [x] T016 [P] Create lib/utils/validation.ts: validateDateNotFuture, validateDateNotBeforeDOB(date, dob), validateWeight(kg), validateHeight(cm), validateTextLength(text, min, max) — each returns { valid: boolean; error?: string }
- [x] T017 [P] Create lib/db/who-reference.ts: loadWHODataset(metric: 'weight'|'height', sex: 'male'|'female'): Promise<WHODataRow[]> using fs/promises to read from public/data/who/; getPercentileSeries(data: WHODataRow[], percentile: number): { x: number; y: number }[] — fully typed with no any
- [x] T018 Create components/ui/Button.tsx with variants (primary, secondary, ghost, destructive), sizes (sm, md, lg), disabled state, explicit props interface, and aria-label support
- [x] T019 [P] Create components/ui/Input.tsx with label prop, error prop (renders descriptive error text below), required indicator, and associated htmlFor/id pairing
- [x] T020 [P] Create components/ui/Card.tsx with claymorphism shadow class, rounded-3xl, pastel background variant prop; also create components/ui/Badge.tsx (source badge: WHO/CDC/AAP) and components/ui/Label.tsx
- [x] T021 Create components/ui/index.ts re-exporting Button, Input, Card, Badge, Label for clean imports
- [x] T022 [P] Create app/(auth)/layout.tsx: centered single-card layout (max-w-md, vertically centered) for unauthenticated pages with Barnshli logo/wordmark and pastel background

**Checkpoint**: Schema applied, types generated, Supabase clients ready, UI primitives exist.
User story implementation may now begin.

---

## Phase 3: User Story 1 — Account Creation & Onboarding (Priority: P1) 🎯 MVP

**Goal**: New visitor can register, complete onboarding (parent + child profile), and land on dashboard.

**Independent Test**: Register with a new email → complete onboarding → dashboard shows one child card.

### Implementation for User Story 1

- [x] T023 Create lib/db/profiles.ts: getProfile(userId: string), upsertProfile(userId: string, data: { display_name: string }) — queries barnshli.profiles using server Supabase client; all return types explicitly typed from types/database.ts
- [x] T024 Create lib/db/children.ts: listChildren(parentId: string), getChild(childId: string, parentId: string), createChild(parentId: string, data), updateChild(childId: string, parentId: string, data), deleteChild(childId: string, parentId: string) — queries barnshli.children with explicit return types
- [x] T025 Create app/api/children/route.ts: GET handler returning listChildren for authenticated user; POST handler validating request body (name, date_of_birth ≤ today, sex ∈ ['male','female']), calling createChild, returning 201 with created child
- [x] T026 [P] [US1] Create components/forms/RegisterForm.tsx: client component with email + password fields, each with visible <label>, submit button, loading state, error display (descriptive message for duplicate email → suggests login)
- [x] T027 [US1] Create app/(auth)/register/page.tsx: server page rendering RegisterForm; on submission calls Supabase signUp({ email, password, options: { emailRedirectTo } }); redirect to /onboarding on success; send confirmation email via Supabase
- [x] T028 [P] [US1] Create components/forms/OnboardingForm.tsx: client component with two sections — parent display name, and child name + date_of_birth (date input, max today) + sex (radio: male/female with visible labels); validation using lib/utils/validation.ts
- [x] T029 [US1] Create app/(app)/onboarding/page.tsx: server page rendering OnboardingForm; on submit: upsertProfile via lib/db/profiles.ts, createChild via lib/db/children.ts (server-side action); redirect to /dashboard on success

**Checkpoint**: User Story 1 fully functional and independently testable.

---

## Phase 4: User Story 2 — Login & Session Continuity (Priority: P2)

**Goal**: Returning user logs in and reaches dashboard; session persists across tab closes.

**Independent Test**: Log in with existing credentials → dashboard; close and reopen → still on dashboard.

### Implementation for User Story 2

- [x] T030 [P] [US2] Create components/forms/LoginForm.tsx: client component with email + password fields (each with <label>), submit button, loading state, generic error message on failure (does not reveal which field is wrong), link to /register and /reset-password
- [x] T031 [US2] Create app/(auth)/login/page.tsx: server page rendering LoginForm; on submission calls Supabase signInWithPassword; redirect to /dashboard on success; session managed by middleware.ts
- [x] T032 [US2] Create app/(auth)/reset-password/page.tsx: email input field with <label>, submit calls Supabase resetPasswordForEmail, shows confirmation message "Check your email for a reset link" after submission
- [x] T033 [US2] Add sign-out action in app/(app)/layout.tsx: server action calling supabase.auth.signOut() and redirecting to /login; render sign-out button in authenticated nav shell

**Checkpoint**: User Story 2 fully functional and independently testable.

---

## Phase 5: User Story 3 — Children Overview Dashboard (Priority: P3)

**Goal**: Parent sees a card per child with name and age; each card links to child detail page.

**Independent Test**: Dashboard with 2 children shows 2 cards; clicking a card navigates to /children/[id].

### Implementation for User Story 3

- [x] T034 Create app/api/children/[id]/route.ts: GET single child by id (validates ownership); PUT to update child (name, date_of_birth, sex) with validation; DELETE to remove child and cascade data via barnshli FK constraints
- [x] T035 [P] [US3] Create components/children/ChildCard.tsx: claymorphism Card displaying child name, formatted age from calculateAgeMonths/formatAge, sex badge; wraps in Next.js <Link> to /children/[id]; min 44×44px touch target; descriptive aria-label
- [x] T036 [P] [US3] Create components/children/AddChildPrompt.tsx: empty-state component shown when parent has no children; contains a call-to-action button linking to a "create child" flow (modal or /onboarding-like form)
- [x] T037 [P] [US3] Create app/(app)/layout.tsx: authenticated shell; sidebar (flex, fixed, w-64) visible on desktop ≥1024px (lg:flex hidden); bottom navigation bar on mobile ≤640px with icons + labels for Dashboard, each child; tablet (640–1024px) collapses to icon-only sidebar with toggle
- [x] T038 [US3] Create app/(app)/dashboard/page.tsx: async server component; fetches children via lib/db/children.ts; renders ChildCard grid (responsive: 1 col mobile, 2 col tablet, 3 col desktop); renders AddChildPrompt when list is empty
- [x] T039 [US3] Create components/children/ChildHeader.tsx: child name as heading, formatted age, sex badge, horizontal tab navigation links (Growth | Words | Milestones) using Next.js <Link> with active state styling
- [x] T040 [US3] Create app/(app)/children/[id]/page.tsx: async server component; fetch child via lib/db/children.ts; validate ownership (404 if not found); render ChildHeader; render summary section with links to growth, words, milestones sub-pages

**Checkpoint**: User Story 3 fully functional and independently testable.

---

## Phase 6: User Story 4 — Growth Tracking & WHO Chart (Priority: P4)

**Goal**: Parent logs weight/height; chart shows child data overlaid on WHO percentile curves.

**Independent Test**: Add 3 growth records → chart renders with child data and WHO curves; validation rejects bad dates and out-of-range values.

### Implementation for User Story 4

- [x] T041 Create lib/db/growth.ts: listGrowthRecords(childId: string): Promise<GrowthRecord[]> ordered by recorded_at ASC; createGrowthRecord(childId: string, data: { recorded_at, weight_kg?, height_cm? }): validates date ≥ child.date_of_birth (fetches child via barnshli.children), validates weight/height ranges via lib/utils/validation.ts, inserts into barnshli.growth_records; all return types from types/database.ts
- [x] T042 Create app/api/children/[id]/growth/route.ts: GET handler returning ordered growth records for child (ownership check); POST handler parsing body, calling createGrowthRecord, returning 201 or 400 with descriptive error message
- [x] T043 [P] [US4] Create components/forms/GrowthForm.tsx: client component with recorded_at date input (max today), weight_kg number input (step 0.01), height_cm number input (step 0.1); each field has visible <label>; descriptive inline error messages; submit calls POST /api/children/[id]/growth; refreshes parent on success via router.refresh()
- [x] T044 [P] [US4] Create components/charts/GrowthChart.tsx: client-only Recharts ComposedChart; accepts childData: { recorded_at: string; weight_kg?: number; height_cm?: number }[] and whoData: { weight: WHOSeries; height: WHOSeries }; renders two tabs (Weight / Height) each with a LineChart: one Line for child data, five ReferenceLine(s) for WHO P3/P15/P50/P85/P97; responsive container; accessible title and legend
- [x] T045 [US4] Create components/charts/index.ts: exports LazyGrowthChart using next/dynamic(() => import('./GrowthChart'), { ssr: false, loading: () => <GrowthChartSkeleton /> }) with a skeleton placeholder matching card height
- [x] T046 [US4] Create app/(app)/children/[id]/growth/page.tsx: async server component; fetch child + growth records via lib/db/growth.ts; load WHO datasets via lib/db/who-reference.ts; pass data as props to LazyGrowthChart; render GrowthForm below chart; include ChildHeader at top

**Checkpoint**: User Story 4 fully functional and independently testable.

---

## Phase 7: User Story 5 — Word Diary (Priority: P5)

**Goal**: Parent logs words with dated variants; displayed in dictionary-style list per child.

**Independent Test**: Add word "bottle" with variants "baba" (earlier) and "ba-ba" (later) → both appear in order under the word entry.

### Implementation for User Story 5

- [x] T047 Create lib/db/words.ts: listWordEntries(childId: string) returning word_entries joined with word_variants ordered by first_heard_at ASC, variants by recorded_at ASC; createWordEntry(childId, { base_word, first_heard_at }); deleteWordEntry(wordEntryId, childId); addWordVariant(wordEntryId, childId, { variant, recorded_at }) — validates ownership; all queries on barnshli.word_entries and barnshli.word_variants
- [x] T048 Create app/api/children/[id]/words/route.ts: GET returns listWordEntries with nested variants array; POST creates new word entry; both with ownership validation and 400/404 error responses
- [x] T049 [P] [US5] Create app/api/children/[id]/words/[wordId]/route.ts: DELETE handler calls deleteWordEntry, returns 204; ownership enforced
- [x] T050 [P] [US5] Create app/api/children/[id]/words/[wordId]/variants/route.ts: POST handler adds variant to existing word entry, validates ownership, returns 201 with new variant
- [x] T051 [US5] Create components/children/WordDiary.tsx: client component; renders dictionary-style scrollable list — each entry shows base_word as heading, first_heard_at, then variants in chronological order with connecting arrow (→); inline "Add variant" form per entry; "Add word" form at top; calls word API endpoints; refreshes on mutations; each form field has visible <label>
- [x] T052 [US5] Create app/(app)/children/[id]/words/page.tsx: async server component; fetch word entries with variants via lib/db/words.ts; render ChildHeader + WordDiary (client) with initial data prop

**Checkpoint**: User Story 5 fully functional and independently testable.

---

## Phase 8: User Story 6 — Custom Milestone Logging (Priority: P6)

**Goal**: Parent logs custom milestones; displayed in reverse-chronological timeline.

**Independent Test**: Add milestone "First steps" with date + location → appears in timeline; second milestone with earlier date appears below it.

### Implementation for User Story 6

- [x] T053 Create lib/db/milestones.ts: listMilestones(childId, type?: 'custom'|'ai') returning barnshli.milestones ordered by date DESC (custom) / sort_order ASC (ai); createCustomMilestone(childId, { title, date, description?, location? }); toggleMilestone(milestoneId, childId, is_checked); deleteMilestone(milestoneId, childId); getAIChecklistForBand(childId, ageBand); bulkInsertAIChecklist(childId, items) — all typed from types/database.ts
- [x] T054 Create app/api/children/[id]/milestones/route.ts: GET with optional ?type=custom|ai query param; POST creates custom milestone (is_custom=true, is_checked=false) with validation (title required, date not future); returns 201 or 400
- [x] T055 [P] [US6] Create app/api/children/[id]/milestones/[milestoneId]/route.ts: PATCH handler updating is_checked boolean; DELETE handler removing milestone; both with ownership validation; PATCH returns updated milestone object
- [x] T056 [US6] Create components/children/MilestoneTimeline.tsx: client component; renders reverse-chronological list of custom milestones as timeline cards (claymorphism Card: title, date, location badge if present, description, delete button); "Add milestone" form (title, date picker max today, optional description, optional location) with visible <label> on each field; calls milestone API; refreshes on mutation
- [x] T057 [US6] Create app/(app)/children/[id]/milestones/page.tsx: async server component; fetch custom milestones and AI checklist items via lib/db/milestones.ts; render ChildHeader, MilestoneTimeline, and AIChecklist (placeholder for US7 if not yet implemented)

**Checkpoint**: User Story 6 fully functional and independently testable.

---

## Phase 9: User Story 7 — AI-Generated Milestone Checklist (Priority: P7)

**Goal**: Age-appropriate checklist generated by Claude, persisted per child + age band, checkable with persistent state.

**Independent Test**: Child aged 18 months → AI checklist generated with WHO/CDC/AAP citations → check one item → reload → item still checked. Invalid API key → friendly error shown, no crash.

### Implementation for User Story 7

- [x] T058 Create lib/ai/prompts/milestones.ts: versioned prompt export (PROMPT_VERSION = 'v1'); buildMilestonePrompt(ageBand: string, sex: 'male'|'female'): { system: string; user: string } — system message instructs Claude to act as a child development expert citing WHO/CDC/AAP; user message requests 8–12 milestones for the age band as a JSON array { title, source, description }; prompt stored in this file only, not inline in route handlers
- [x] T059 Create app/api/children/[id]/milestones/ai-generate/route.ts: POST handler; fetch child (ownership check); compute ageBand via getAgeBand(calculateAgeMonths(child.date_of_birth)); call getAIChecklistForBand — if records exist return { source: 'cache', items }; otherwise call Anthropic SDK (claude-sonnet-4-5-20251001 model) with buildMilestonePrompt, parse JSON response, bulk insert via bulkInsertAIChecklist with is_custom=false, return { source: 'generated', items }; catch Anthropic errors and return 503 with { error: 'AI service unavailable. Please try again later.' }
- [x] T060 [P] [US7] Create components/children/AIChecklist.tsx: client component accepting initialItems prop; renders checklist group per age band label; each item: checkbox (<input type="checkbox"> with associated <label> containing title + source Badge); checked items visually distinguished (line-through, muted colour); loading skeleton while fetching; error state with friendly message and retry button; calls POST ai-generate on mount if initialItems empty, PATCH toggle on checkbox change
- [x] T061 [US7] Wire AIChecklist into app/(app)/children/[id]/milestones/page.tsx: pass AI checklist items (from lib/db/milestones.ts) as initialItems prop; AIChecklist handles its own API interactions client-side

**Checkpoint**: User Story 7 fully functional and independently testable.

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: GDPR compliance, accessibility audit, type safety verification, end-to-end validation.

- [x] T062 Create app/api/account/route.ts: DELETE handler; authenticate user via server Supabase client; call supabase.auth.admin.deleteUser(userId) using SUPABASE_SERVICE_ROLE_KEY (server-only); all barnshli data deleted via ON DELETE CASCADE on barnshli.children.parent_id and transitively; return 204; client should clear session and redirect to /
- [x] T063 [P] Audit all form components in components/forms/ and components/children/: verify every <input>, <select>, <textarea> has a corresponding visible <label> with correct htmlFor/id pairing; verify error messages are descriptive and suggest corrective action (Principle III)
- [x] T064 [P] Verify WCAG 2.1 AA contrast ratios for all custom colour tokens in tailwind.config.ts against both white and dark backgrounds; document pass/fail per colour in a comment block in tailwind.config.ts; adjust failing tokens
- [x] T065 [P] Run `pnpm tsc --noEmit` and resolve all TypeScript errors; confirm no `any` types remain in lib/db/, lib/ai/, components/, or app/api/; confirm all exported functions have explicit return types (Principle I)
- [x] T066 Run quickstart.md validation flows 1–7 sequentially; confirm all flows complete without errors; note any discrepancies and update quickstart.md accordingly
- [x] T067 [P] Commit final types/database.ts (after last supabase gen types run) and updated .env.example to confirm schema and environment documentation is accurate

---

## Phase 10: Plan Update — Milestone Split, User Challenges & Login i18n

**Purpose**: Implement the three changes from the 2026-03-23 plan update.

- [x] T068 [P] Translate all auth forms to Norwegian: LoginForm.tsx ("Logg inn", "E-postadresse", "Passord", etc.), RegisterForm.tsx, reset-password/page.tsx; update login/page.tsx metadata title to "Logg inn"
- [x] T069 [P] Add source column migration: create supabase/migrations/004_milestones_source.sql (ALTER TABLE barnshli.milestones ADD COLUMN source text); update types/database.ts to add source field to milestones Row/Insert/Update
- [x] T070 Update lib/db/milestones.ts: add createUserChallenge(childId, { title, ageBand }): Promise<Milestone> inserting with is_custom=false, source='user'; update bulkInsertAIChecklist to set source='ai'; update getAIChecklistForBand to filter source IN ('ai', null) only; add getUserChallengesForBand(childId, ageBand) returning source='user' items
- [x] T071 Update app/api/children/[id]/milestones/route.ts: extend POST to handle type='challenge' in body — calls createUserChallenge (no date required, uses ageBand from body); existing custom path unchanged
- [x] T072 Create app/(app)/children/[id]/milestones/layout.tsx: server component wrapping children with a sub-nav (two tabs: "AI-sjekkliste" → /milestones/ai, "Mine milepæler" → /milestones/custom) with active-state styling using usePathname; renders ChildHeader
- [x] T073 Create app/(app)/children/[id]/milestones/ai/page.tsx: move AI checklist logic from old milestones/page.tsx here; fetch child + AI items + user challenges; pass aiItems and userChallenges to AIChecklist
- [x] T074 Create app/(app)/children/[id]/milestones/custom/page.tsx: move custom milestone logic from old milestones/page.tsx here; fetch child + custom milestones; render MilestoneTimeline
- [x] T075 Update app/(app)/children/[id]/milestones/page.tsx: replace content with redirect to /children/[id]/milestones/ai using Next.js redirect()
- [x] T076 Extend components/children/AIChecklist.tsx: accept userChallenges prop (Milestone[]); add "Ekstra utfordringer" section below checklist with toggle support; add "Legg til ekstra utfordring" inline form that POSTs with type='challenge' to milestones API

---

## Phase 11: Session Expiry — Redirect to Login

**Purpose**: Ensure expired sessions always redirect the user back to `/login` and restore their intended destination after re-authentication.

- [x] T077 Update spec.md: extend US2 and add FR-027/FR-028 for session expiry redirect + returnTo behaviour
- [x] T078 Update app/middleware.ts: add `returnTo=<pathname>` search param to the `/login` redirect for protected routes (sanitise: only if pathname starts with `/`)
- [x] T079 Update components/forms/LoginForm.tsx: read `returnTo` from `useSearchParams()`; after successful sign-in redirect to `returnTo` if it is an internal path, otherwise `/dashboard`; wrap login/page.tsx in Suspense for the search-params read
- [x] T080 Create components/auth/SessionGuard.tsx: client component; subscribes to `supabase.auth.onAuthStateChange`; on `SIGNED_OUT` event redirects to `/login?returnTo=<pathname>` using `useRouter` + `usePathname`
- [x] T081 Mount SessionGuard in app/(app)/layout.tsx so it is active on every authenticated page

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately; T002–T006 can run in parallel with T001
- **Foundational (Phase 2)**: Depends on Setup completion — T007→T008→T009→T010 must run sequentially; T011–T022 can follow T010 in parallel
- **US1 (Phase 3)**: Depends on Foundational — T023→T024 sequentially (lib/db before API); T026+T028 parallel; T027+T029 sequential after forms
- **US2 (Phase 4)**: Depends on Foundational — T030+T032 parallel; T031 after T030; T033 requires app/(app)/layout.tsx from US3 or can be a stub
- **US3 (Phase 5)**: Depends on T024 (lib/db/children.ts); T034–T037 parallel; T038 after T035+T036; T039–T040 sequential
- **US4 (Phase 6)**: Depends on T024 (children), T016 (WHO helpers); T041→T042 sequential; T043+T044 parallel; T045 after T044; T046 after T045
- **US5 (Phase 7)**: Depends on Foundational; T047→T048 sequential; T049+T050 parallel; T051 after T049+T050; T052 after T051
- **US6 (Phase 8)**: Depends on T053 (lib/db/milestones.ts); T054→T055 parallel; T056 after T054; T057 after T056
- **US7 (Phase 9)**: Depends on T053, T056, T057; T058→T059 sequential; T060 after T059; T061 after T060
- **Polish (Phase N)**: Depends on all user stories complete

### User Story Dependencies

- **US1 (P1)**: No dependency on other stories — start after Foundational
- **US2 (P2)**: No dependency on other stories — start after Foundational
- **US3 (P3)**: Depends on US1 (lib/db/children.ts) — can share the library
- **US4 (P4)**: Depends on US3 (child detail page structure) — adds growth tab
- **US5 (P5)**: Depends on US3 (child detail page structure) — adds words tab
- **US6 (P6)**: Depends on US3 (child detail page structure) — adds milestones tab
- **US7 (P7)**: Depends on US6 (lib/db/milestones.ts and milestones page) — extends existing milestone UI

### Within Each User Story

- lib/db/ functions before Route Handlers (routes depend on DB layer)
- Route Handlers before client-facing form components (forms call routes)
- Components before page files (pages render components)
- Parallel tasks within a story: forms, charts, utility functions that touch different files

---

## Parallel Opportunities

### Phase 2 Parallel Batch (after T010)
```
T011 lib/supabase/client.ts
T012 lib/supabase/server.ts
T014 lib/supabase/middleware.ts
T015 lib/utils/age.ts
T016 lib/utils/validation.ts
T017 lib/db/who-reference.ts
T019 components/ui/Input.tsx
T020 components/ui/Card.tsx + Badge.tsx + Label.tsx
T022 app/(auth)/layout.tsx
```

### Phase 5 Parallel Batch (US3, after T034)
```
T035 components/children/ChildCard.tsx
T036 components/children/AddChildPrompt.tsx
T037 app/(app)/layout.tsx
```

### Phase 6 Parallel Batch (US4, after T042)
```
T043 components/forms/GrowthForm.tsx
T044 components/charts/GrowthChart.tsx
```

---

## Implementation Strategy

### MVP First (User Stories 1–3 Only)

1. Complete Phase 1 (Setup)
2. Complete Phase 2 (Foundational — critical blocker)
3. Complete Phase 3 (US1 — registration + onboarding)
4. Complete Phase 4 (US2 — login)
5. Complete Phase 5 (US3 — dashboard + child detail shell)
6. **STOP AND VALIDATE**: Full auth flow + dashboard functional
7. Deploy preview — share with stakeholders

### Incremental Delivery

1. MVP → US4 (Growth chart — high-frequency, high-value)
2. → US5 (Word diary — emotionally engaging)
3. → US6 (Custom milestones — personal narrative)
4. → US7 (AI checklist — platform differentiator)
5. → Polish (GDPR, accessibility, type audit)

### Parallel Team Strategy

With multiple developers, after Phase 2 completes:
- Developer A: US1 + US2 (auth flows)
- Developer B: US3 (dashboard + layout)
- Developer C: US4 (growth chart — self-contained)
- US5–US7 pick up sequentially or by a fourth developer

---

## Notes

- **barnshli schema**: All Supabase clients must use `db: { schema: 'barnshli' }`. Type gen command: `supabase gen types typescript --schema barnshli > types/database.ts`
- **[P]** = parallelizable with other [P] tasks at the same phase level (different files, no shared dependencies)
- **Story label** = maps task to user story for independent traceability
- Growth chart (T044) MUST be imported via `next/dynamic({ ssr: false })` — never directly in a Server Component
- Commit after each phase or logical group using Conventional Commits
- Stop at any checkpoint to demo the story independently before advancing
