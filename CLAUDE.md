# barnshli Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-03-23

## Active Technologies

- TypeScript 5.x (strict mode), Node.js 20+ + Next.js 15 (App Router), Tailwind CSS v4, Supabase JS v2, (001-nurtureai-platform)

## Project Structure

```text
app/              # Next.js App Router pages and Route Handlers
components/       # Shared UI (ui/, forms/, charts/, children/)
lib/              # Business logic (ai/prompts/, db/, supabase/, utils/)
types/            # supabase gen types output → database.ts
public/data/who/  # Static WHO reference JSON datasets
```

## Commands

```bash
pnpm dev          # Start development server
pnpm build        # Production build
pnpm tsc --noEmit # Type check (must pass before commit)
pnpm lint         # ESLint (must pass before commit)
supabase gen types typescript --local > types/database.ts  # After schema changes
```

## Code Style

- TypeScript strict mode — no `any`, explicit return types on all exports
- Server Components by default; `'use client'` only for interactive UI
- Tailwind utility classes; claymorphism tokens defined in `tailwind.config.ts`
- All DB queries in `lib/db/`; no Supabase calls in page or component files
- AI prompts versioned in `lib/ai/prompts/milestones.ts`
- Conventional Commits enforced via commitlint + husky

## Key Architectural Decisions

- **Milestone pages are split**: `/children/[id]/milestones/ai/` for AI checklist + user challenges; `/children/[id]/milestones/custom/` for personal timeline. The parent route `/milestones/` redirects to `/milestones/ai`.
- **Three milestone types** in one `milestones` table: `is_custom=true` (diary entry), `is_custom=false + source≠'user'` (AI-generated), `is_custom=false + source='user'` (user-added challenge from AI checklist page).
- **UI language is Norwegian (Bokmål)** throughout — all user-facing strings hard-coded in Norwegian, including auth pages.

## Recent Changes

- 001-nurtureai-platform: Added TypeScript 5.x (strict mode), Node.js 20+ + Next.js 15 (App Router), Tailwind CSS v4, Supabase JS v2,
- 001-nurtureai-platform (plan update 2026-03-23): Split milestone pages (ai/ + custom/); added user-challenge feature on AI checklist page; mandated Norwegian translation of auth pages.

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
