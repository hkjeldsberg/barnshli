# API Contracts: Barnshli — Child Development Platform

**Branch**: `001-nurtureai-platform` | **Date**: 2026-03-23
**Phase**: 1 — Design

All routes are Next.js App Router Route Handlers located under `app/api/`.
All endpoints require an authenticated session (enforced in middleware and per-handler).
All request/response bodies are `application/json`.
Error responses follow a consistent shape: `{ "error": "<message>" }`.

Authentication is handled entirely by Supabase Auth — no custom auth endpoints
are defined here.

---

## Children

### `GET /api/children`

Returns all children belonging to the authenticated user.

**Response 200**:
```json
[
  {
    "id": "uuid",
    "name": "string",
    "date_of_birth": "YYYY-MM-DD",
    "sex": "male | female",
    "age_months": 18,
    "created_at": "ISO8601"
  }
]
```

---

### `POST /api/children`

Creates a new child profile.

**Request body**:
```json
{
  "name": "string (required, 1–100 chars)",
  "date_of_birth": "YYYY-MM-DD (required, not future)",
  "sex": "male | female (required)"
}
```

**Response 201**: Created child object (same shape as GET item).

**Response 400**: Validation error — future date, missing required field, invalid sex.

---

### `GET /api/children/[id]`

Returns a single child by ID (must belong to authenticated user).

**Response 200**: Child object.
**Response 404**: Child not found or not owned by user.

---

### `PUT /api/children/[id]`

Updates name, date_of_birth, or sex of a child.

**Request body**: Any subset of `{ name, date_of_birth, sex }`.

**Response 200**: Updated child object.
**Response 400**: Validation error.
**Response 404**: Not found / not owned.

---

### `DELETE /api/children/[id]`

Deletes a child and all associated data (cascade via DB).

**Response 204**: No content.
**Response 404**: Not found / not owned.

---

## Growth Records

### `GET /api/children/[id]/growth`

Returns all growth records for a child, ordered by `recorded_at` ascending.

**Response 200**:
```json
[
  {
    "id": "uuid",
    "child_id": "uuid",
    "recorded_at": "YYYY-MM-DD",
    "weight_kg": 10.5,
    "height_cm": 78.0,
    "created_at": "ISO8601"
  }
]
```

---

### `POST /api/children/[id]/growth`

Logs a new growth measurement.

**Request body**:
```json
{
  "recorded_at": "YYYY-MM-DD (required, >= child DOB, not future)",
  "weight_kg": 10.5,
  "height_cm": 78.0
}
```
At least one of `weight_kg` or `height_cm` must be provided.

**Response 201**: Created record.
**Response 400**: Validation error (date before DOB, implausible value, neither field
  provided).

---

## Word Diary

### `GET /api/children/[id]/words`

Returns all word entries for a child with their variants, ordered by `first_heard_at`
ascending.

**Response 200**:
```json
[
  {
    "id": "uuid",
    "base_word": "bottle",
    "first_heard_at": "YYYY-MM-DD",
    "variants": [
      { "id": "uuid", "variant": "baba", "recorded_at": "YYYY-MM-DD" },
      { "id": "uuid", "variant": "ba-ba", "recorded_at": "YYYY-MM-DD" }
    ]
  }
]
```

---

### `POST /api/children/[id]/words`

Creates a new word entry.

**Request body**:
```json
{
  "base_word": "string (required, 1–200 chars)",
  "first_heard_at": "YYYY-MM-DD (required)"
}
```

**Response 201**: Created word entry (variants array empty).

---

### `DELETE /api/children/[id]/words/[wordId]`

Deletes a word entry and all its variants.

**Response 204**: No content.
**Response 404**: Not found / not owned.

---

### `POST /api/children/[id]/words/[wordId]/variants`

Adds a pronunciation variant to an existing word entry.

**Request body**:
```json
{
  "variant": "string (required, 1–200 chars)",
  "recorded_at": "YYYY-MM-DD (required)"
}
```

**Response 201**:
```json
{ "id": "uuid", "variant": "ba-ba", "recorded_at": "YYYY-MM-DD" }
```

---

## Milestones

### `GET /api/children/[id]/milestones`

Returns all milestones for a child. Supports optional query param `?type=custom|ai`
to filter. Default: returns all.

**Response 200**:
```json
[
  {
    "id": "uuid",
    "title": "First steps",
    "date": "YYYY-MM-DD",
    "description": "string | null",
    "location": "string | null",
    "is_custom": true,
    "is_checked": false,
    "source": "null | WHO | CDC | AAP",
    "age_band": "null | 12-18mo",
    "sort_order": null,
    "created_at": "ISO8601"
  }
]
```

---

### `POST /api/children/[id]/milestones`

Creates a custom milestone.

**Request body**:
```json
{
  "title": "string (required, 1–300 chars)",
  "date": "YYYY-MM-DD (required, not future)",
  "description": "string | null",
  "location": "string | null"
}
```

**Response 201**: Created milestone object (`is_custom: true`, `is_checked: false`).

---

### `PATCH /api/children/[id]/milestones/[milestoneId]`

Toggles `is_checked` state (works for both custom and AI milestones).

**Request body**:
```json
{ "is_checked": true }
```

**Response 200**: Updated milestone object.
**Response 404**: Not found / not owned.

---

### `DELETE /api/children/[id]/milestones/[milestoneId]`

Deletes a milestone (custom or AI-generated).

**Response 204**: No content.

---

### `POST /api/children/[id]/milestones/ai-generate`

Triggers AI generation of age-appropriate milestone checklist for the child's
current age band. Idempotent — if records already exist for the current band,
returns them without calling Claude.

**Request body**: Empty (`{}`).

**Response 200** (existing records returned):
```json
{ "source": "cache", "items": [ /* milestone objects */ ] }
```

**Response 201** (newly generated):
```json
{ "source": "generated", "items": [ /* milestone objects */ ] }
```

**Response 400**: Child age is outside the 0–60 month range (e.g. child is 5+).

**Response 503**: Claude API unavailable. Body: `{ "error": "AI service unavailable. Please try again later." }`

---

## Account

### `DELETE /api/account`

Permanently deletes the authenticated user's account and all associated data
(GDPR right-to-erasure). Requires a valid session.

**Response 204**: No content. Client should redirect to landing page and clear session.
**Response 401**: Not authenticated.

---

## Common Error Codes

| Status | Meaning |
|--------|---------|
| 400    | Validation error — see `error` field for details |
| 401    | Not authenticated (no valid session) |
| 403    | Authenticated but not the owner of the resource |
| 404    | Resource not found (or forbidden — merged to prevent enumeration) |
| 503    | External service unavailable (Claude API) |
