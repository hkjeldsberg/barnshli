-- ============================================================
-- Migration 001: Create barnshli schema and all tables
-- ============================================================

CREATE SCHEMA IF NOT EXISTS barnshli;

-- ---------------------------------------------------------
-- profiles: extends auth.users (1:1)
-- ---------------------------------------------------------
CREATE TABLE barnshli.profiles (
  id           UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL CHECK (char_length(display_name) BETWEEN 1 AND 100),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- children: belongs to a parent profile
-- ---------------------------------------------------------
CREATE TABLE barnshli.children (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  parent_id       UUID NOT NULL REFERENCES barnshli.profiles(id) ON DELETE CASCADE,
  name            TEXT NOT NULL CHECK (char_length(name) BETWEEN 1 AND 100),
  date_of_birth   DATE NOT NULL CHECK (date_of_birth <= CURRENT_DATE),
  sex             TEXT NOT NULL CHECK (sex IN ('male', 'female')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- growth_records: weight/height measurements per child
-- ---------------------------------------------------------
CREATE TABLE barnshli.growth_records (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id     UUID NOT NULL REFERENCES barnshli.children(id) ON DELETE CASCADE,
  recorded_at  DATE NOT NULL,
  weight_kg    NUMERIC(5, 2) CHECK (weight_kg > 0 AND weight_kg <= 100),
  height_cm    NUMERIC(5, 2) CHECK (height_cm > 0 AND height_cm <= 130),
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  -- At least one of weight or height must be provided
  CONSTRAINT at_least_one_measurement CHECK (
    weight_kg IS NOT NULL OR height_cm IS NOT NULL
  )
);

-- ---------------------------------------------------------
-- word_entries: vocabulary tracking per child
-- ---------------------------------------------------------
CREATE TABLE barnshli.word_entries (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id       UUID NOT NULL REFERENCES barnshli.children(id) ON DELETE CASCADE,
  base_word      TEXT NOT NULL CHECK (char_length(base_word) BETWEEN 1 AND 200),
  first_heard_at DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- word_variants: pronunciation progression per word entry
-- ---------------------------------------------------------
CREATE TABLE barnshli.word_variants (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  word_entry_id  UUID NOT NULL REFERENCES barnshli.word_entries(id) ON DELETE CASCADE,
  variant        TEXT NOT NULL CHECK (char_length(variant) BETWEEN 1 AND 200),
  recorded_at    DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------
-- milestones: custom (is_custom=true) + AI (is_custom=false)
-- ---------------------------------------------------------
CREATE TABLE barnshli.milestones (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  child_id    UUID NOT NULL REFERENCES barnshli.children(id) ON DELETE CASCADE,
  title       TEXT NOT NULL CHECK (char_length(title) BETWEEN 1 AND 500),
  achieved_at DATE,
  is_custom   BOOLEAN NOT NULL DEFAULT true,
  completed   BOOLEAN NOT NULL DEFAULT false,
  age_band    TEXT CHECK (
    age_band IN (
      '0-3mo', '3-6mo', '6-9mo', '9-12mo',
      '12-18mo', '18-24mo', '24-36mo', '36-48mo', '48-60mo'
    )
  ),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
