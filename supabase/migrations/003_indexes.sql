-- ============================================================
-- Migration 003: Performance indexes on barnshli tables
-- ============================================================

-- All children for a parent (dashboard query)
CREATE INDEX idx_children_parent
  ON barnshli.children(parent_id);

-- Growth records ordered by date (chart query)
CREATE INDEX idx_growth_records_child_date
  ON barnshli.growth_records(child_id, recorded_at DESC);

-- Milestones filtered by type and age band
CREATE INDEX idx_milestones_child_custom
  ON barnshli.milestones(child_id, is_custom, age_band);

-- Word variants in chronological order
CREATE INDEX idx_word_variants_entry_date
  ON barnshli.word_variants(word_entry_id, recorded_at ASC);

-- Word entries for a child ordered by first heard
CREATE INDEX idx_word_entries_child_date
  ON barnshli.word_entries(child_id, first_heard_at ASC);
