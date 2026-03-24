# Feature Specification: Barnshli — Child Development Platform

**Feature Branch**: `001-nurtureai-platform`
**Created**: 2026-03-23
**Status**: Draft
**Input**: Barnshli is a personalized child development platform for tech-savvy parents,
offering milestone tracking, growth monitoring, and AI-powered developmental guidance
for children aged 0–5.

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Account Creation & Onboarding (Priority: P1)

A new visitor arrives at the app, creates a private account with email and password,
enters their own name and basic profile details, then adds at least one child's name
and date of birth. After onboarding they land on their personalized dashboard.

**Why this priority**: Without an account and at least one child profile, no other
feature in the platform can work. This is the foundational entry point for every user.

**Independent Test**: A new user can register, complete onboarding (parent + child
profile), and land on their dashboard — all without any other platform feature being
present.

**Acceptance Scenarios**:

1. **Given** a visitor is on the registration page, **When** they submit a valid email
   and password, **Then** their account is created, a confirmation email is sent, and
   they are guided to onboarding.
2. **Given** a user is in the onboarding flow, **When** they save their parent profile
   and at least one child's name and date of birth, **Then** the data is persisted and
   they are redirected to the dashboard.
3. **Given** a user submits an email already in use, **When** they attempt to register,
   **Then** a clear, descriptive error message explains the conflict and suggests
   logging in instead.

---

### User Story 2 — Login & Session Continuity (Priority: P2)

A returning user opens the app, logs in with their email and password, and is taken
directly to their dashboard or the last page they visited.

**Why this priority**: Returning users are the primary daily active audience.
Friction-free login is essential to retention and daily use.

**Independent Test**: A user with an existing account can log in and reach their
dashboard in one step, independent of any tracking or AI features.

**Acceptance Scenarios**:

1. **Given** a registered user is on the login page, **When** they submit correct
   credentials, **Then** they are authenticated and redirected to their dashboard.
2. **Given** a user submits incorrect credentials, **When** login is attempted, **Then**
   an informative error message is shown without revealing which field is wrong.
3. **Given** an authenticated user closes and reopens the app, **When** their session
   is still valid, **Then** they are taken directly to their dashboard without
   re-authenticating.

---

### User Story 3 — Children Overview Dashboard (Priority: P3)

A parent with one or more children sees a dashboard card for each child, showing the
child's name, current age, and a brief summary. Each card links to that child's
dedicated detail page.

**Why this priority**: The dashboard is the hub of daily use; parents need an
at-a-glance view of all their children before diving into a specific child's data.

**Independent Test**: A user with multiple children can view all child cards on the
dashboard and navigate to any individual child's page, without growth charts or AI
features being functional.

**Acceptance Scenarios**:

1. **Given** a logged-in parent has two children, **When** they open the dashboard,
   **Then** two cards are displayed, each showing the child's name and calculated age.
2. **Given** a parent clicks a child's card, **When** the navigation occurs, **Then**
   they are taken to that child's dedicated detail page.
3. **Given** a parent has no children yet, **When** they open the dashboard, **Then**
   they see a clear prompt to add their first child.

---

### User Story 4 — Growth Tracking & WHO Chart (Priority: P4)

A parent logs their child's weight (kg) and height (cm) with a date. They can view a
line chart of their child's measurements over time, overlaid with age-appropriate WHO
reference curves for both weight and height.

**Why this priority**: Growth monitoring is one of the highest-frequency features for
parents of infants and toddlers; it delivers immediate, objective value.

**Independent Test**: A parent can add three growth measurements and see them plotted
against WHO reference data on a chart, with no milestone or AI features needed.

**Acceptance Scenarios**:

1. **Given** a parent is on their child's growth page, **When** they submit a weight
   and height measurement with a date, **Then** the entry is saved and appears on the
   chart.
2. **Given** at least one measurement exists, **When** the growth chart is displayed,
   **Then** the child's data points are plotted alongside the WHO reference percentile
   curves for the child's sex and age.
3. **Given** a parent enters an implausible measurement (e.g. weight of 0 kg), **When**
   they submit, **Then** a descriptive validation error is shown.

---

### User Story 5 — Word Diary (Priority: P5)

A parent records words their child has said, each with a date first heard. They can
also add multiple dated variants of the same word (e.g. "baba" → "ba-ba" → "bottle")
to track pronunciation evolution. All words are displayed in a dictionary-style list
for the child.

**Why this priority**: Language development is a key developmental concern for parents
of 0–5-year-olds; this feature adds unique, emotionally resonant value.

**Independent Test**: A parent can add a word with two variants, and see the word and
its progression in the word diary, without any other feature being active.

**Acceptance Scenarios**:

1. **Given** a parent is on the word diary page, **When** they add a word with a date,
   **Then** the entry appears in the dictionary-style list.
2. **Given** a word entry exists, **When** the parent adds a second dated variant,
   **Then** both variants are displayed in chronological order under the same entry.
3. **Given** multiple words have been added, **When** the parent views the diary,
   **Then** entries are ordered in a browsable list (e.g. alphabetically or by date
   added).

---

### User Story 6 — Custom Milestone Logging (Priority: P6)

A parent records custom milestones their child has reached — with date, title,
optional description/comment, and optional location. Logged milestones appear in a
chronological timeline on a **dedicated "Mine milepæler" page** (separate from the
AI checklist).

**Why this priority**: Custom milestones capture the personal narrative of each child's
development and give the platform emotional depth; they complement the AI-generated
checklist. Separating the two views reduces cognitive load and allows each to grow
independently.

**Independent Test**: A parent can create a milestone entry with all fields and see it
appear in the child's "Mine milepæler" timeline, with no AI features needed.

**Acceptance Scenarios**:

1. **Given** a parent navigates to the "Mine milepæler" sub-page, **When** they save a
   milestone with a title and date, **Then** the milestone appears in the child's
   timeline.
2. **Given** a parent adds an optional location to a milestone, **When** viewed in the
   timeline, **Then** the location is displayed alongside the other details.
3. **Given** multiple milestones exist, **When** the timeline is displayed, **Then**
   entries are ordered chronologically (most recent first by default).

---

### User Story 7 — AI-Generated Milestone Checklist (Priority: P7)

The platform generates an age-appropriate milestone checklist for each child based on
their current age, using Claude AI drawing on WHO, CDC, and AAP developmental
guidelines. This checklist lives on a **dedicated "AI-sjekkliste" page** (separate from
custom milestones). Parents can check off milestones as their child achieves them.

In addition, once all AI-generated milestones are reached (or at any time), a parent
can add **extra age-appropriate challenges** directly on the AI checklist page. These
user-added challenges appear in a separate "Ekstra utfordringer" section below the
AI checklist, offering further developmental stimulation tailored to the child's age band.

**Why this priority**: This is the AI-powered differentiator of the platform. Splitting
AI checklist and custom milestones into separate pages removes confusion between
structured developmental guidance and personal diary entries. The extra challenges
feature addresses the scenario where all AI milestones are completed and the parent
wants continued developmental engagement.

**Independent Test**: For a child aged 18 months, the system generates a checklist,
the parent checks one item (persisted on reload), and the parent adds one extra
challenge that appears in the "Ekstra utfordringer" section.

**Acceptance Scenarios**:

1. **Given** a child has a known date of birth, **When** the parent views the
   AI-sjekkliste page, **Then** an AI-generated list of age-appropriate milestones is
   displayed, each citing a source (WHO, CDC, or AAP).
2. **Given** a checklist is displayed, **When** the parent checks a milestone,
   **Then** the item is visually distinguished as achieved and the state is persisted.
3. **Given** a child's age crosses a new developmental stage, **When** the parent
   revisits the checklist, **Then** the list reflects the updated age range.
4. **Given** the AI service is temporarily unavailable, **When** the parent requests
   the checklist, **Then** a friendly error message explains the situation and prompts
   them to try again later.
5. **Given** a parent is on the AI-sjekkliste page, **When** they submit a challenge
   title via the "Legg til ekstra utfordring" form, **Then** the challenge appears in
   the "Ekstra utfordringer" section below the AI checklist with a checkable state.
6. **Given** an extra challenge exists, **When** the parent checks it off, **Then** the
   checked state is persisted and the item is visually distinguished as completed.

---

### Edge Cases

- A parent adds two children with the same name — the system MUST distinguish them
  (e.g. by date of birth) and not merge their data.
- A child's date of birth is set to a future date — the system MUST reject this with a
  clear validation error.
- A parent deletes their account — all associated child data MUST be deleted in
  compliance with GDPR.
- The child turns 5 years old while using the app — the AI checklist MUST gracefully
  handle the boundary of the 0–5 age range (e.g. show a final-stage checklist or a
  message that the developmental stage is complete).
- A parent logs a growth measurement dated before the child's date of birth — the
  system MUST reject this entry.
- A word diary entry is added with no date — the system MUST require a date or default
  to today's date with a visible indication.

## Requirements *(mandatory)*

### Functional Requirements

**Account & Auth**

- **FR-001**: System MUST allow visitors to create an account with email and password.
- **FR-002**: System MUST send a confirmation email upon successful registration.
- **FR-003**: System MUST authenticate returning users with email and password.
- **FR-004**: System MUST maintain authenticated sessions so users are not required to
  log in on every visit within a valid session window.
- **FR-005**: System MUST provide a password reset flow via email.

**Profiles**

- **FR-006**: Users MUST be able to create and edit a parent profile (name, optional
  details).
- **FR-007**: Users MUST be able to create one or more child profiles, each with a
  name, date of birth, and sex (used for WHO reference curves).
- **FR-008**: System MUST calculate and display each child's current age dynamically
  from their date of birth.
- **FR-009**: System MUST prevent creation of a child profile with a future date of
  birth.

**Growth Tracking**

- **FR-010**: Users MUST be able to log weight (kg) and height (cm) measurements for a
  child, each with an associated date.
- **FR-011**: System MUST display logged measurements on a line chart per child.
- **FR-012**: System MUST overlay WHO reference percentile curves (for weight-for-age
  and height-for-age, by sex) on the growth chart.
- **FR-013**: System MUST validate that measurement dates are not before the child's
  date of birth.
- **FR-014**: System MUST validate that weight and height values are within a
  physiologically plausible range for ages 0–5.

**Word Diary**

- **FR-015**: Users MUST be able to add a word entry with a title and the date it was
  first heard.
- **FR-016**: Users MUST be able to add multiple dated pronunciation variants to a
  single word entry.
- **FR-017**: System MUST display word entries in a browsable dictionary-style list per
  child, with variants shown in chronological order.

**Milestone Tracking**

- **FR-018**: Users MUST be able to log a custom milestone with: title (required),
  date (required), description/comment (optional), and location (optional).
- **FR-019**: System MUST display custom milestones in a chronological timeline on a
  dedicated "Mine milepæler" page (`/children/[id]/milestones/custom`), separate from
  the AI checklist.
- **FR-020**: System MUST generate an AI-powered developmental milestone checklist for
  each child, appropriate to their current age, citing WHO, CDC, or AAP sources. The
  checklist MUST be displayed on a dedicated "AI-sjekkliste" page
  (`/children/[id]/milestones/ai`).
- **FR-021**: Users MUST be able to check off individual AI-generated milestone items.
- **FR-022**: System MUST persist the checked/unchecked state of AI-generated
  milestones per child.
- **FR-023**: System MUST surface a friendly error if the AI checklist generation
  fails, without crashing the page.
- **FR-024-ext**: Users MUST be able to add extra age-appropriate challenges on the
  AI-sjekkliste page via a "Legg til ekstra utfordring" form. These challenges are
  stored with `source = 'user'` and displayed in an "Ekstra utfordringer" section
  below the AI-generated list.
- **FR-025-ext**: Extra user-added challenges MUST support the same check/uncheck
  toggle and persisted state as AI-generated items.

**Localisation**

- **FR-026**: The login page and all auth pages (login, register, reset-password)
  MUST be fully translated to Norwegian (Bokmål). No English-language strings are
  permitted in the auth UI.

**Data & Privacy**

- **FR-024**: System MUST isolate all data (children, measurements, words, milestones)
  per authenticated user — no cross-user data access is permitted.
- **FR-025**: System MUST support account and data deletion in compliance with GDPR
  right-to-erasure requirements.

### Key Entities

- **Parent (User)**: The authenticated account holder. Has a name and account
  credentials. Can own multiple child profiles.
- **Child**: Belongs to one parent. Has a name, date of birth, and sex. Is the central
  entity around which all tracking data is organized.
- **GrowthMeasurement**: Belongs to a child. Records weight (kg), height (cm), and
  date. Multiple entries per child over time.
- **WordEntry**: Belongs to a child. Has a primary word title and date first heard.
  Can have multiple `WordVariant` sub-entries each with their own text and date.
- **WordVariant**: Belongs to a WordEntry. Represents one pronunciation or form of the
  word at a specific date.
- **Milestone**: Belongs to a child. Records title, date, optional description, and
  optional location. User-created.
- **AIChecklistItem**: Belongs to a child. Represents one AI-generated developmental
  milestone for the child's age range. Has a description, source citation, and
  completed boolean.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A new user can create an account, complete onboarding (parent + first
  child profile), and reach their dashboard in under 3 minutes.
- **SC-002**: A returning user can log in and reach their dashboard in under 30
  seconds.
- **SC-003**: A parent can add a growth measurement and see it appear on the chart in
  under 10 seconds.
- **SC-004**: The AI-generated milestone checklist for a child loads and is readable in
  under 5 seconds under normal conditions.
- **SC-005**: All primary user flows (account creation, child profile, growth log,
  word diary, milestone log, AI checklist) are completable on a mobile screen of
  375 px width without horizontal scrolling.
- **SC-006**: 90% of users can complete the onboarding flow (account + first child
  profile) without external help or error recovery.
- **SC-007**: Growth charts remain readable and correctly scaled when a child has
  between 1 and 50 logged measurements.
- **SC-008**: The word diary remains browsable and performant with up to 500 word
  entries per child.
- **SC-009**: All UI elements meet a color contrast ratio of at least 4.5:1 for normal
  text and 3:1 for large text, verified against the pastel palette used.

## Assumptions

- Authentication uses email + password as the primary method; social login (Google,
  Apple) is out of scope for this release.
- WHO weight-for-age and height-for-age reference data is embedded or fetched from a
  static source; real-time WHO API integration is not required.
- AI milestone checklist content is generated on demand (not pre-cached per child)
  unless performance testing reveals a need to cache.
- Sex field on a child profile accepts two values (male / female) matching WHO
  reference curve datasets; non-binary options and custom entries are out of scope for
  this release.
- The platform is a web application (responsive, mobile-first); native mobile apps
  are out of scope.
- The UI language is Norwegian (Bokmål) throughout. Formal i18n/multi-language
  infrastructure is out of scope; all user-facing strings are hard-coded in Norwegian.
- Photo or media uploads for milestones are out of scope for this release.

## Out of Scope

- Social features (sharing milestones, public profiles)
- Native iOS or Android applications
- Third-party calendar integration
- Pediatrician or healthcare-provider access
- Push notifications
- Photo or video attachments
- Multi-language / i18n infrastructure (app is Norwegian-only by convention)
