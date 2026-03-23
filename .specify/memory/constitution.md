<!--
SYNC IMPACT REPORT
==================
Version change: 0.0.0 → 1.0.0
Bump rationale: MAJOR — first population of all placeholders; entire
  governance structure introduced from scratch.

Modified principles: N/A (initial population)

Added sections:
  - Core Principles (5 principles)
  - Technology Stack & Conventions
  - Development Workflow & Quality Gates
  - Governance

Removed sections: None

Templates requiring updates:
  ✅ .specify/templates/plan-template.md — Constitution Check gate language
     aligns with the 5 principles defined here; no structural update required.
  ✅ .specify/templates/spec-template.md — mandatory sections (User Scenarios,
     Requirements, Success Criteria) are consistent with principles I, III, V.
  ✅ .specify/templates/tasks-template.md — phase structure and test-optional
     policy are consistent with principles I and V; no update required.
  ✅ .specify/templates/checklist-template.md — generic per-feature template;
     no constitution-specific changes needed.
  ✅ .specify/templates/agent-file-template.md — generic; no changes needed.
  ✅ .claude/commands/*.md — all commands reference "constitution file"
     generically; no agent-specific naming issues found.

Deferred items: None — all placeholders resolved.
-->

# Barnshli Constitution

## Core Principles

### I. Type Safety & Code Quality

All TypeScript MUST be written in strict mode. The `any` type is prohibited;
use `unknown` with narrowing, or define explicit interfaces. Every exported
function MUST declare an explicit return type.

No source file may exceed 300 lines. When a file approaches this limit it MUST
be split into focused modules before the next commit. Commit messages MUST
follow Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`, `style:`,
`refactor:`, `test:`), and a new commit MUST be created after each major
feature or implementation phase.

External dependencies MUST be minimized; prefer native browser APIs and
Next.js built-ins over third-party packages. New features MUST NOT modify
core or shared modules unless strictly necessary.

### II. Performance-First Rendering

Server Components are the default. A component MUST NOT be a Client Component
unless it requires browser-only interactivity (event handlers, browser APIs,
or React state/effects that cannot be lifted to the server).

No blocking third-party scripts are permitted in the critical render path.
Non-critical UI (charts, AI-generated content, heavy widgets) MUST be
lazy-loaded so that the initial paint is not delayed.

### III. Accessibility & Universal Design

The application MUST be usable by all children regardless of ability.
Non-negotiable rules:

- Color contrast ratio MUST be ≥ 4.5:1 for normal text and ≥ 3:1 for large
  text (WCAG 2.1 AA).
- Every `<img>` MUST have descriptive `alt` text; decorative images MUST use
  `alt=""`.
- Every form field MUST be associated with a visible `<label>`; placeholder
  text MUST NOT serve as the only label.
- Error messages MUST be descriptive and MUST suggest a corrective action.
- Interactive touch targets MUST be at least 44 × 44 px on mobile.
- Responsive layout MUST work from 375 px (mobile) to 1440 px+ (desktop).
- No content may flash more than 3 times per second (WCAG 2.3.1).

### IV. Security, Privacy & Child Safety

Authentication is handled exclusively via Supabase Auth. Custom session
management is prohibited. Session tokens MUST never be exposed client-side or
committed to version control.

Data collection MUST be minimal and purposeful — only what the application
requires to function. Children's personal data MUST be treated with the
highest sensitivity: it MUST never be shared with third parties or used for
model training.

`.env.local` MUST be gitignored. All required environment variables MUST be
documented in `.env.example`. GDPR obligations apply to all user data; data
retention and deletion flows MUST be designed before any feature that stores
personal data is shipped.

### V. Maintainability & Architecture

The folder structure MUST follow Next.js App Router conventions:

- Shared UI in `components/`
- Business logic in `lib/`
- Database queries in `lib/db/`
- AI prompts versioned and stored in `lib/ai/prompts/` — not inline in
  components

No business logic is permitted in page or route files; all logic MUST be
delegated to `lib/` functions. All Supabase queries MUST be typed using
generated types from `supabase gen types`.

## Technology Stack & Conventions

**Framework**: Next.js (App Router)
**Language**: TypeScript (strict mode)
**Auth & Database**: Supabase (Auth + Postgres)
**Styling**: To be determined per feature — follow project conventions.
**Type generation**: `supabase gen types typescript` — run after any schema
change and commit the generated file.
**Environment**: `.env.local` (gitignored) + `.env.example` (committed,
documented).

Any addition of a new external dependency MUST be justified in the PR
description with a rationale for why a native or existing package is
insufficient.

## Development Workflow & Quality Gates

Every pull request MUST pass the following checks before merge:

1. **Type check**: `tsc --noEmit` reports zero errors.
2. **Lint**: No lint violations introduced.
3. **Accessibility**: New UI components verified against Principle III rules
   (contrast, labels, touch targets, alt text).
4. **Security review**: No session tokens exposed; `.env.local` not committed;
   children's data handling reviewed for GDPR compliance.
5. **Constitution check**: PR author confirms no principle violations; any
   unavoidable deviation MUST be documented in the PR and requires reviewer
   sign-off.

Commits MUST be made after each major feature or implementation phase. PRs
SHOULD be small and focused; large refactors MUST be split from feature work.

## Governance

This constitution supersedes all other project practices. Any amendment
requires:

1. A written proposal describing the change and its rationale.
2. An updated version number following semantic versioning:
   - **MAJOR**: Backward-incompatible governance changes, principle removals,
     or redefinitions.
   - **MINOR**: New principle or section added, or materially expanded
     guidance.
   - **PATCH**: Clarifications, wording improvements, or non-semantic
     refinements.
3. An update to `LAST_AMENDED_DATE` and the Sync Impact Report comment.
4. Propagation of any affected template or command files.

All PRs and code reviews MUST verify compliance with these principles.
Complexity that would violate a principle MUST be justified in writing before
being introduced. Use `.claude/commands/speckit.constitution.md` for the
amendment workflow.

**Version**: 1.0.0 | **Ratified**: 2026-03-23 | **Last Amended**: 2026-03-23
