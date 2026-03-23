# Quickstart: Barnshli — Child Development Platform

**Branch**: `001-nurtureai-platform` | **Date**: 2026-03-23

This guide covers local development setup, environment configuration, and
end-to-end validation of all primary user flows.

---

## Prerequisites

- Node.js 20+ (`node --version`)
- pnpm 9+ (`pnpm --version`; install via `npm i -g pnpm`)
- Supabase CLI (`pnpm add -g supabase` or Homebrew: `brew install supabase/tap/supabase`)
- A Supabase project (free tier works for development)
- An Anthropic API key

---

## 1. Clone & Install

```bash
git clone <repo-url>
cd barnshli
pnpm install
```

---

## 2. Environment Variables

Copy the example file and fill in your values:

```bash
cp .env.example .env.local
```

**.env.example** (committed — document all required keys):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://<project-ref>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>   # Server-only; never expose client-side

# Anthropic
ANTHROPIC_API_KEY=<your-api-key>

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

> **Never commit `.env.local`** — it is gitignored. The service-role key and
> Anthropic API key are server-side only.

---

## 3. Database Setup

### Option A — Local Supabase (recommended for development)

```bash
supabase start                    # starts local Postgres + Auth on Docker
supabase db push                  # applies migrations from supabase/migrations/
supabase gen types typescript --local > types/database.ts
```

### Option B — Remote Supabase project

```bash
supabase link --project-ref <PROJECT_REF>
supabase db push
supabase gen types typescript --project-id <PROJECT_REF> > types/database.ts
```

> Re-run `supabase gen types` and commit `types/database.ts` after every schema change.

---

## 4. WHO Reference Data

The static WHO Child Growth Standards JSON files must be present at:

```text
public/data/who/
├── weight-for-age-boys.json
├── weight-for-age-girls.json
├── height-for-age-boys.json
└── height-for-age-girls.json
```

These are committed to the repository. No action required unless updating the dataset.

---

## 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 6. Validate Primary User Flows

Work through each flow in order. Each should complete without errors.

### Flow 1 — Account Registration & Onboarding

1. Navigate to `/register`.
2. Enter a valid email and a password (min 8 chars).
3. Submit → expect to be redirected to `/onboarding`.
4. Enter parent display name and submit.
5. Enter child name, date of birth (e.g. 2025-01-15), select sex, submit.
6. Expect redirect to `/dashboard`.
7. Dashboard MUST show one child card with the correct name and calculated age.

### Flow 2 — Login & Session

1. Sign out (profile menu → sign out).
2. Navigate to `/login`.
3. Log in with the credentials from Flow 1.
4. Expect redirect to `/dashboard`.
5. Close and reopen the browser tab — expect dashboard without re-login prompt.

### Flow 3 — Children Overview

1. From the dashboard, add a second child via the "Add child" prompt.
2. Verify two child cards appear, each with correct names and ages.
3. Click the first child's card → expect navigation to `/children/[id]`.

### Flow 4 — Growth Tracking & WHO Chart

1. Navigate to a child's growth page (`/children/[id]/growth`).
2. Add a weight and height measurement with today's date.
3. Verify the entry appears on the line chart.
4. Verify WHO reference percentile curves are overlaid on the chart.
5. Attempt to add a measurement with `recorded_at` before the child's DOB →
   expect a validation error.
6. Attempt to add `weight_kg = 0` → expect a validation error.

### Flow 5 — Word Diary

1. Navigate to `/children/[id]/words`.
2. Add a word "bottle" with a date.
3. Verify it appears in the dictionary list.
4. Add a variant "baba" with an earlier date.
5. Add a variant "ba-ba" with a later date.
6. Verify variants appear in chronological order under the "bottle" entry.

### Flow 6 — Custom Milestone Logging

1. Navigate to `/children/[id]/milestones`.
2. Log a custom milestone: title "First steps", today's date, optional location.
3. Verify it appears in the timeline with all entered details.
4. Log a second milestone with an earlier date.
5. Verify timeline is ordered chronologically (most recent first).

### Flow 7 — AI Milestone Checklist

1. On the milestones page, trigger the AI checklist (button or automatic load).
2. Verify a list of age-appropriate milestones appears with source citations
   (WHO, CDC, or AAP).
3. Check one milestone item.
4. Reload the page — verify the checked state persists.
5. To test the error state: temporarily set `ANTHROPIC_API_KEY=invalid` in
   `.env.local`, restart the dev server, and trigger generation again → expect a
   friendly error message, no crash.

---

## 7. Type Check & Lint

```bash
pnpm tsc --noEmit     # must exit 0
pnpm lint             # must exit 0
```

---

## 8. Commit Convention Reminder

All commits must follow Conventional Commits:

```bash
git commit -m "feat: add growth record form with WHO chart overlay"
git commit -m "fix: reject measurement dates before child DOB"
git commit -m "chore: run supabase gen types after schema migration"
```

The pre-commit hook (`husky` + `commitlint`) will reject non-conforming messages.
