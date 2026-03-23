-- ============================================================
-- Migration 002: Grants and Row Level Security for barnshli schema
-- ============================================================

-- ---------------------------------------------------------
-- Schema usage grants
-- ---------------------------------------------------------
GRANT USAGE ON SCHEMA barnshli TO anon, authenticated;

-- ---------------------------------------------------------
-- Table-level grants
-- ---------------------------------------------------------
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA barnshli TO authenticated;
GRANT SELECT ON ALL TABLES IN SCHEMA barnshli TO anon;

-- Ensure future tables inherit the same grants
ALTER DEFAULT PRIVILEGES IN SCHEMA barnshli
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA barnshli
  GRANT SELECT ON TABLES TO anon;

-- ---------------------------------------------------------
-- Enable RLS on all tables
-- ---------------------------------------------------------
ALTER TABLE barnshli.profiles      ENABLE ROW LEVEL SECURITY;
ALTER TABLE barnshli.children      ENABLE ROW LEVEL SECURITY;
ALTER TABLE barnshli.growth_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE barnshli.word_entries   ENABLE ROW LEVEL SECURITY;
ALTER TABLE barnshli.word_variants  ENABLE ROW LEVEL SECURITY;
ALTER TABLE barnshli.milestones     ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------
-- profiles: users can only read/write their own profile
-- ---------------------------------------------------------
CREATE POLICY "profiles: own row" ON barnshli.profiles
  FOR ALL USING (id = auth.uid());

-- ---------------------------------------------------------
-- children: parent can CRUD their own children
-- ---------------------------------------------------------
CREATE POLICY "children: own children" ON barnshli.children
  FOR ALL USING (parent_id = auth.uid());

-- ---------------------------------------------------------
-- growth_records: access via child ownership
-- ---------------------------------------------------------
CREATE POLICY "growth_records: own children" ON barnshli.growth_records
  FOR ALL USING (
    child_id IN (
      SELECT id FROM barnshli.children WHERE parent_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- word_entries: access via child ownership
-- ---------------------------------------------------------
CREATE POLICY "word_entries: own children" ON barnshli.word_entries
  FOR ALL USING (
    child_id IN (
      SELECT id FROM barnshli.children WHERE parent_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- word_variants: access via word_entry → child ownership
-- ---------------------------------------------------------
CREATE POLICY "word_variants: own children" ON barnshli.word_variants
  FOR ALL USING (
    word_entry_id IN (
      SELECT we.id FROM barnshli.word_entries we
      JOIN barnshli.children c ON c.id = we.child_id
      WHERE c.parent_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- milestones: access via child ownership
-- ---------------------------------------------------------
CREATE POLICY "milestones: own children" ON barnshli.milestones
  FOR ALL USING (
    child_id IN (
      SELECT id FROM barnshli.children WHERE parent_id = auth.uid()
    )
  );
