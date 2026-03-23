# Data Model: Barnshli — Child Development Platform

**Branch**: `001-nurtureai-platform` | **Date**: 2026-03-23
**Phase**: 1 — Design

---

## Entity Relationship Overview

```text
auth.users (Supabase managed)
    │
    └── profiles (1:1)
            │
            └── children (1:N)
                    │
                    ├── growth_records (1:N)
                    │
                    ├── word_entries (1:N)
                    │       └── word_variants (1:N)
                    │
                    └── milestones (1:N)
                            (is_custom = true  → parent-logged milestone)
                            (is_custom = false → AI-generated checklist item)
```

---

## Tables

### `profiles`

Extends `auth.users`. Created automatically on first sign-in via a Supabase trigger or
on onboarding form submit.

| Column         | Type                    | Constraints                          |
|----------------|-------------------------|--------------------------------------|
| `id`           | `uuid`                  | PK, FK → `auth.users.id` ON DELETE CASCADE |
| `display_name` | `text`                  | NOT NULL, length 1–100               |
| `created_at`   | `timestamptz`           | DEFAULT `now()`                      |
| `updated_at`   | `timestamptz`           | DEFAULT `now()`                      |

**RLS policy**: User can SELECT/UPDATE/DELETE only their own row (`id = auth.uid()`).

---

### `children`

| Column          | Type                     | Constraints                                              |
|-----------------|--------------------------|----------------------------------------------------------|
| `id`            | `uuid`                   | PK, DEFAULT `gen_random_uuid()`                          |
| `parent_id`     | `uuid`                   | NOT NULL, FK → `profiles.id` ON DELETE CASCADE           |
| `name`          | `text`                   | NOT NULL, length 1–100                                   |
| `date_of_birth` | `date`                   | NOT NULL, CHECK `date_of_birth <= current_date`          |
| `sex`           | `text`                   | NOT NULL, CHECK `sex IN ('male', 'female')`              |
| `created_at`    | `timestamptz`            | DEFAULT `now()`                                          |
| `updated_at`    | `timestamptz`            | DEFAULT `now()`                                          |

**RLS policy**: All operations restricted to rows where `parent_id = auth.uid()`.

**Validation rules**:
- `date_of_birth` MUST NOT be in the future (enforced by CHECK constraint + application
  layer validation).
- `name` MUST be non-empty after trimming.
- Two children with the same name under the same parent are allowed; they are
  distinguished by `id` and `date_of_birth` (the UI displays both when names collide).

---

### `growth_records`

| Column        | Type           | Constraints                                                            |
|---------------|----------------|------------------------------------------------------------------------|
| `id`          | `uuid`         | PK, DEFAULT `gen_random_uuid()`                                        |
| `child_id`    | `uuid`         | NOT NULL, FK → `children.id` ON DELETE CASCADE                         |
| `recorded_at` | `date`         | NOT NULL, CHECK `recorded_at >= children.date_of_birth` (app-layer)   |
| `weight_kg`   | `numeric(5,2)` | NULLABLE, CHECK `weight_kg > 0 AND weight_kg <= 100`                   |
| `height_cm`   | `numeric(5,2)` | NULLABLE, CHECK `height_cm > 0 AND height_cm <= 130`                   |
| `created_at`  | `timestamptz`  | DEFAULT `now()`                                                        |

**Notes**:
- At least one of `weight_kg` or `height_cm` MUST be present (enforced application-layer).
- The date-vs-birth validation (`recorded_at >= date_of_birth`) is enforced in
  `lib/db/growth.ts` via a check against the child record before insert.
- Weight range: physiologically 0–100 kg covers newborn to obese 5-year-old.
- Height range: up to 130 cm covers the tallest 5-year-olds on WHO charts.

**RLS policy**: SELECT/INSERT/UPDATE/DELETE restricted to rows where the parent of the
referenced `child_id` is `auth.uid()` (via JOIN or sub-select on `children`).

---

### `word_entries`

| Column          | Type          | Constraints                                       |
|-----------------|---------------|---------------------------------------------------|
| `id`            | `uuid`        | PK, DEFAULT `gen_random_uuid()`                   |
| `child_id`      | `uuid`        | NOT NULL, FK → `children.id` ON DELETE CASCADE    |
| `base_word`     | `text`        | NOT NULL, length 1–200                            |
| `first_heard_at`| `date`        | NOT NULL, DEFAULT `current_date`                  |
| `created_at`    | `timestamptz` | DEFAULT `now()`                                   |

**RLS policy**: Same pattern as `growth_records` — parent ownership via `child_id`.

---

### `word_variants`

| Column          | Type          | Constraints                                            |
|-----------------|---------------|--------------------------------------------------------|
| `id`            | `uuid`        | PK, DEFAULT `gen_random_uuid()`                        |
| `word_entry_id` | `uuid`        | NOT NULL, FK → `word_entries.id` ON DELETE CASCADE     |
| `variant`       | `text`        | NOT NULL, length 1–200                                 |
| `recorded_at`   | `date`        | NOT NULL, DEFAULT `current_date`                       |
| `created_at`    | `timestamptz` | DEFAULT `now()`                                        |

**RLS policy**: Inherited through `word_entries` → `children` ownership chain.

---

### `milestones`

Stores both user-created custom milestones (`is_custom = true`) and AI-generated
checklist items (`is_custom = false`). Unified table avoids duplication of the
`is_checked` toggle logic.

| Column        | Type          | Constraints                                       |
|---------------|---------------|---------------------------------------------------|
| `id`          | `uuid`        | PK, DEFAULT `gen_random_uuid()`                   |
| `child_id`    | `uuid`        | NOT NULL, FK → `children.id` ON DELETE CASCADE    |
| `title`       | `text`        | NOT NULL, length 1–300                            |
| `date`        | `date`        | NOT NULL for custom; DEFAULT `null` for AI items  |
| `description` | `text`        | NULLABLE                                          |
| `location`    | `text`        | NULLABLE                                          |
| `is_custom`   | `boolean`     | NOT NULL, DEFAULT `true`                          |
| `is_checked`  | `boolean`     | NOT NULL, DEFAULT `false`                         |
| `source`      | `text`        | NULLABLE — e.g. `'WHO'`, `'CDC'`, `'AAP'`        |
| `age_band`    | `text`        | NULLABLE — e.g. `'12-18mo'`; set for AI items    |
| `sort_order`  | `integer`     | NULLABLE — display order within AI checklist band |
| `created_at`  | `timestamptz` | DEFAULT `now()`                                   |

**Validation rules**:
- Custom milestones (`is_custom = true`): `date` MUST be present and NOT in the future.
- AI items (`is_custom = false`): `date` is NULL (no specific date); `age_band` and
  `source` MUST be present.
- `age_band` values: `'0-3mo'`, `'3-6mo'`, `'6-9mo'`, `'9-12mo'`, `'12-18mo'`,
  `'18-24mo'`, `'24-36mo'`, `'36-48mo'`, `'48-60mo'`.

**RLS policy**: Same parent-ownership chain as other child tables.

---

## Indexes

```sql
-- Frequent queries: all growth records for a child ordered by date
CREATE INDEX idx_growth_records_child_date ON growth_records(child_id, recorded_at DESC);

-- Frequent queries: all milestones for a child, custom vs AI
CREATE INDEX idx_milestones_child_custom ON milestones(child_id, is_custom, age_band);

-- Frequent queries: word variants ordered by date
CREATE INDEX idx_word_variants_entry_date ON word_variants(word_entry_id, recorded_at ASC);

-- Frequent queries: all children for a parent
CREATE INDEX idx_children_parent ON children(parent_id);
```

---

## State Transitions

### AI Checklist Generation

```text
Child age changes band
        ↓
Route Handler: POST /api/children/[id]/milestones/ai-generate
        ↓
Query: any rows WHERE child_id = ? AND is_custom = false AND age_band = currentBand
        ↓
Rows exist? ──YES──→ Return existing rows (no Claude call)
        │
       NO
        ↓
Call Claude API with milestones prompt (age band + child sex)
        ↓
Parse response → insert rows (is_custom=false, is_checked=false, age_band, source)
        ↓
Return inserted rows to client
```

### Milestone Toggle

```text
Parent checks/unchecks a milestone
        ↓
PATCH /api/children/[id]/milestones/[milestoneId]
        ↓
UPDATE milestones SET is_checked = !is_checked WHERE id = ? AND child_id = ?
        ↓
Return updated row
```

---

## Supabase Type Generation

After schema is applied, run:

```bash
pnpm supabase gen types typescript --project-id <PROJECT_ID> > types/database.ts
```

All `lib/db/*.ts` functions MUST import from `types/database.ts` and use
`Database['public']['Tables']` row types. No `any` types permitted (Constitution I).
