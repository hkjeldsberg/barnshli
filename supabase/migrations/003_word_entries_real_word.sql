-- Migration 003: Add real_word column to word_entries
-- real_word stores the canonical/real-language equivalent of the child's word

ALTER TABLE barnshli.word_entries
  ADD COLUMN IF NOT EXISTS real_word TEXT;
