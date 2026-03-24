-- Add source column to barnshli.milestones
-- Used to distinguish AI-generated items (source='ai') from user-added challenges (source='user').
-- Custom milestones (is_custom=true) leave source NULL.
ALTER TABLE barnshli.milestones ADD COLUMN IF NOT EXISTS source text;
