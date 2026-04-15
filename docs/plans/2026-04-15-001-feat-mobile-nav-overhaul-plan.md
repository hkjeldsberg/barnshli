---
title: "feat: Mobile navigation overhaul — sidebar drawer + tab bottom nav"
type: feat
status: active
date: 2026-04-15
---

# feat: Mobile navigation overhaul — sidebar drawer + tab bottom nav

## Overview

Two focused mobile UX changes:
1. Sidebar becomes openable via a hamburger toggle on mobile (Streamlit-style slide-in drawer).
2. Bottom nav bar replaces "Hjem / [NAVN] / Legg til" with context-aware tabs: Vekst, Ordbok, Milepæler — linking to the currently active child.

## Problem Frame

On mobile the sidebar is fully hidden with no way to access it. The current bottom nav wastes space showing child avatars and a "Legg til" link — not the most useful actions when you're already inside a child's section. The three primary sub-sections (Vekst, Ordbok, Milepæler) should be one tap away at all times when viewing a child.

## Requirements Trace

- R1. Mobile users can open and close the sidebar via a hamburger button.
- R2. The bottom nav on mobile shows Vekst, Ordbok, and Milepæler — linking to the active child's routes.
- R3. When not on a child route, bottom nav degrades gracefully (Hjem + Legg til or hidden tabs).
- R4. Active tab is visually highlighted.
- R5. No regression to desktop layout (≥1024px stays unchanged).

## Scope Boundaries

- Desktop sidebar: unchanged.
- Sidebar content (SidebarNav component): unchanged.
- Auth pages, onboarding, dashboard pages: unchanged.
- Animation: simple CSS translate slide-in is sufficient; no animation library.

## Context & Research

### Relevant Code and Patterns

- `app/(app)/layout.tsx` — Server component. Renders desktop sidebar + mobile bottom nav inline. Passes `childrenList` to `SidebarNav`. The mobile nav is currently inline JSX — will be extracted.
- `components/layout/SidebarNav.tsx` — Client component. Uses `useParams` + `usePathname`. Tabs: Oversikt, Vekst, Ordbok, Milepæler.
- `app/(app)/children/[id]/page.tsx` — Shows the three sections (Vekst, Ordbok, Milepæler) as cards — same labels and routes the bottom nav will use.
- Tailwind breakpoints in use: `lg:` = 1024px. Mobile = below 1024px.
- Claymorphism tokens: `bg-cream-50`, `border-cream-200`, `shadow-clay-sm`, `rounded-2xl`, `rounded-3xl`.

### Institutional Learnings

- `layout.tsx` is a Server Component (`async`) — all interactive/stateful logic must be extracted into `'use client'` components.
- `'use client'` components can use `useParams()` and `usePathname()` from `next/navigation`.
- `SidebarNav` already demonstrates the `useParams` + `usePathname` pattern for active-state detection.

## Key Technical Decisions

- **Sidebar drawer as its own client component**: `layout.tsx` cannot hold toggle state (server component). Extract `MobileSidebarDrawer` as a `'use client'` component that owns `isOpen` state, renders the hamburger button, overlay backdrop, and the slide-in panel (which reuses `SidebarNav`).
- **Bottom nav as its own client component**: `MobileBottomNav` uses `useParams()` to get the active child ID. Links built as `/children/[id]/growth` etc. When no child ID in params, Milepæler/Vekst/Ordbok links are hidden or replaced with Hjem + Legg til fallback.
- **Hamburger button placement**: Rendered inside `MobileSidebarDrawer`, positioned top-left of the main content area (fixed, `lg:hidden`, `z-30`). Does not live inside `<aside>`.
- **Overlay**: Semi-transparent backdrop behind the open drawer; tap to close. `z-25` between backdrop and drawer.
- **Bottom nav tab active state**: Use `pathname.startsWith(tabPath)` — same logic as `SidebarNav`.

## Open Questions

### Resolved During Planning

- **What shows in bottom nav when not on a child page?** Show Hjem link + Legg til link as fallback. Vekst/Ordbok/Milepæler only appear when `childId` is present in params.
- **Does `MobileBottomNav` need `childrenList`?** No — it only needs the current child ID from `useParams`. The list is not needed for the new tab-based design.
- **Sign-out on mobile?** Accessible via the sidebar drawer (existing button in layout). No change needed.

### Deferred to Implementation

- Exact transition/animation class values (translate-x, duration) — tune during implementation.
- Whether to add `aria-expanded` and `aria-controls` to the hamburger button — straightforward accessibility addition, implementer should include it.

## Implementation Units

- [x] **Unit 1: MobileSidebarDrawer component**

**Goal:** Client component that owns sidebar open/close state on mobile, renders hamburger toggle + slide-in drawer with existing `SidebarNav`.

**Requirements:** R1, R5

**Dependencies:** None (reuses existing `SidebarNav`).

**Files:**
- Create: `components/layout/MobileSidebarDrawer.tsx`
- Modify: `app/(app)/layout.tsx`

**Approach:**
- `MobileSidebarDrawer` accepts `{ childrenList: Child[] }` and renders:
  - Hamburger `<button>` (fixed top-left, `lg:hidden`, `z-30`) — toggles `isOpen`
  - Backdrop `<div>` (fixed fullscreen, semi-transparent, `lg:hidden`, visible when open) — click closes
  - `<aside>` panel: same visual styling as the desktop sidebar (`bg-cream-50 border-r border-cream-200 shadow-clay-sm`) but positioned as a fixed overlay (`translate-x-0` open / `-translate-x-full` closed), `lg:hidden`
  - Inside the panel: "barnshli" logo link, `<SidebarNav>`, sign-out form (copy from layout)
- In `layout.tsx`: remove the inline sign-out form from the desktop aside (keep it), add `<MobileSidebarDrawer childrenList={childrenList} />` for mobile. The desktop `<aside>` remains untouched.
- Sign-out `action` stays as a server action defined in `layout.tsx`; pass it as a prop to `MobileSidebarDrawer` OR duplicate the minimal server action inline — implementer's call, but the server action must stay in a server context.

**Patterns to follow:**
- `components/layout/SidebarNav.tsx` — `'use client'` with `useParams`/`usePathname`
- Desktop aside in `app/(app)/layout.tsx` lines 33–53 — visual styles to mirror

**Test scenarios:**
- Happy path: hamburger button renders on mobile viewport; clicking it opens the drawer.
- Happy path: drawer contains `SidebarNav` with the children list.
- Happy path: clicking the backdrop closes the drawer.
- Happy path: drawer is hidden on desktop (`lg:hidden` applied).
- Edge case: drawer closed by default on mount (no flash of open state).
- Integration: navigation link inside the drawer navigates correctly and closes the drawer after navigation (use router events or click handler).

**Verification:**
- Hamburger visible at mobile breakpoint, absent at ≥1024px.
- Drawer slides in/out on toggle.
- Desktop sidebar layout unchanged.

---

- [x] **Unit 2: MobileBottomNav component**

**Goal:** Client component replacing the inline mobile bottom nav. Shows Vekst / Ordbok / Milepæler tabs linked to the active child when on a child route; degrades to Hjem + Legg til otherwise.

**Requirements:** R2, R3, R4, R5

**Dependencies:** Unit 1 (layout.tsx restructuring in progress; coordinate file edits).

**Files:**
- Create: `components/layout/MobileBottomNav.tsx`
- Modify: `app/(app)/layout.tsx`

**Approach:**
- `MobileBottomNav` is `'use client'`, takes no props.
- `useParams()` to read `id` (child ID). `usePathname()` for active state.
- When `childId` present: render three tabs — Vekst (`/children/[id]/growth`, icon 📈), Ordbok (`/children/[id]/words`, icon 💬), Milepæler (`/children/[id]/milestones`, icon ⭐).
- When `childId` absent: render Hjem (`/dashboard`, icon 🏠) + Legg til (`/children/new`, icon +).
- Active tab: `pathname.startsWith(tabHref)` → apply `text-sage-600 font-semibold` (match SidebarNav active style).
- Outer `<nav>` keeps existing classes: `lg:hidden fixed bottom-0 inset-x-0 bg-cream-50 border-t border-cream-200 flex items-center justify-around px-2 py-2 z-20`.
- In `layout.tsx`: remove inline `<nav>` bottom nav block, add `<MobileBottomNav />`.

**Patterns to follow:**
- `components/layout/SidebarNav.tsx` — active-state class logic with `pathname.startsWith`
- Existing bottom nav in `app/(app)/layout.tsx` lines 61–91 — visual classes to reuse

**Test scenarios:**
- Happy path: on `/children/[id]/growth`, bottom nav shows Vekst (active), Ordbok, Milepæler.
- Happy path: on `/children/[id]/words`, Ordbok tab is active.
- Happy path: on `/children/[id]/milestones/*`, Milepæler tab is active.
- Happy path: on `/dashboard` (no child param), shows Hjem + Legg til fallback.
- Edge case: navigating between children updates the tab links to the new child's ID.
- Edge case: bottom nav hidden on desktop (≥1024px).
- Integration: tab links navigate to correct child-scoped routes.

**Verification:**
- On child pages: three section tabs visible, correct active highlighting.
- On non-child pages: fallback nav visible.
- Desktop bottom nav: not visible.

## System-Wide Impact

- **Interaction graph:** `layout.tsx` renders both components; `SidebarNav` is reused inside the drawer. No other components affected.
- **Error propagation:** Both components are leaf UI — no error propagation concerns.
- **State lifecycle risks:** Drawer `isOpen` state should reset on route change to avoid stuck-open drawer after navigation. Implement with `usePathname` effect or a click handler on nav links.
- **API surface parity:** None — pure UI change.
- **Integration coverage:** Navigation from inside the drawer to a child route should update the bottom nav tabs correctly (both components independently read from params/pathname).
- **Unchanged invariants:** Desktop layout (`lg:` breakpoint) is explicitly untouched. `SidebarNav` component interface unchanged.

## Risks & Dependencies

| Risk | Mitigation |
|------|------------|
| Sign-out server action in a client component | Pass action as prop from layout, or keep a separate `<form action={signOut}>` server boundary inside the drawer panel |
| Drawer stays open after navigation | Add `useEffect` on `pathname` to call `setIsOpen(false)`, or attach close handler to each nav link |
| `useParams` returns null outside child routes | Guard with `const childId = params?.id as string \| undefined` before constructing hrefs |
| `pb-20 lg:pb-0` on `<main>` must be preserved | Already set in layout.tsx:56; verify it accounts for the bottom nav height after refactor |

## Sources & References

- Relevant code: `app/(app)/layout.tsx`, `components/layout/SidebarNav.tsx`
- Related routes: `app/(app)/children/[id]/page.tsx` (section labels/icons)
