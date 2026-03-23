-- ============================================================
-- Migration 002: Enable RLS and add parent-ownership policies
-- ============================================================

-- ---------------------------------------------------------
-- profiles
-- ---------------------------------------------------------
ALTER TABLE barnshli.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles: owner only"
  ON barnshli.profiles
  FOR ALL
  USING (id = auth.uid())
  WITH CHECK (id = auth.uid());

-- ---------------------------------------------------------
-- children
-- ---------------------------------------------------------
ALTER TABLE barnshli.children ENABLE ROW LEVEL SECURITY;

CREATE POLICY "children: owner only"
  ON barnshli.children
  FOR ALL
  USING (parent_id = auth.uid())
  WITH CHECK (parent_id = auth.uid());

-- ---------------------------------------------------------
-- growth_records
-- ---------------------------------------------------------
ALTER TABLE barnshli.growth_records ENABLE ROW LEVEL SECURITY;

CREATE POLICY "growth_records: owner only"
  ON barnshli.growth_records
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM barnshli.children c
      WHERE c.id = child_id AND c.parent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM barnshli.children c
      WHERE c.id = child_id AND c.parent_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- word_entries
-- ---------------------------------------------------------
ALTER TABLE barnshli.word_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "word_entries: owner only"
  ON barnshli.word_entries
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM barnshli.children c
      WHERE c.id = child_id AND c.parent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM barnshli.children c
      WHERE c.id = child_id AND c.parent_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- word_variants
-- ---------------------------------------------------------
ALTER TABLE barnshli.word_variants ENABLE ROW LEVEL SECURITY;

CREATE POLICY "word_variants: owner only"
  ON barnshli.word_variants
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM barnshli.word_entries we
      JOIN barnshli.children c ON c.id = we.child_id
      WHERE we.id = word_entry_id AND c.parent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM barnshli.word_entries we
      JOIN barnshli.children c ON c.id = we.child_id
      WHERE we.id = word_entry_id AND c.parent_id = auth.uid()
    )
  );

-- ---------------------------------------------------------
-- milestones
-- ---------------------------------------------------------
ALTER TABLE barnshli.milestones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "milestones: owner only"
  ON barnshli.milestones
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM barnshli.children c
      WHERE c.id = child_id AND c.parent_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM barnshli.children c
      WHERE c.id = child_id AND c.parent_id = auth.uid()
    )
  );
