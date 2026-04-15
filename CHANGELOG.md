# Changelog

## [Unreleased]

### 2026-04-15

#### Added
- `MobileSidebarDrawer` component: hamburger toggle (mobile-only, `lg:hidden`) opens a slide-in drawer with full sidebar nav and sign-out. Closes on route change or backdrop tap.
- `MobileBottomNav` component: replaces inline bottom nav. Shows Vekst / Ordbok / Milepæler tabs linked to the active child when on a child route; falls back to Hjem + Legg til otherwise. Active tab highlighted.

#### Changed
- `app/(app)/layout.tsx`: extracted mobile bottom nav into `MobileBottomNav`, added `MobileSidebarDrawer`. Mobile main content top padding increased to `pt-16` to clear the hamburger button. Desktop layout unchanged.
