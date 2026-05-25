-- Run this in Supabase SQL Editor to set up the reports table

CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY,
  idea_summary TEXT,
  industry TEXT,
  business_model TEXT,
  target_market TEXT,
  overall_risk_score INTEGER,
  viability_score INTEGER,
  difficulty_rating INTEGER,
  monetization_timeline_months INTEGER,
  risk_factors JSONB,
  similar_failed_startups JSONB DEFAULT '[]',
  competitor_analysis TEXT,
  unit_economics_assessment TEXT,
  action_plan JSONB,
  user_id TEXT DEFAULT '',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for report lookup
CREATE INDEX IF NOT EXISTS idx_reports_id ON reports(id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- Enable RLS but allow public read/write (no auth required)
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public insert" ON reports
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "Allow public select" ON reports
  FOR SELECT TO anon, authenticated
  USING (true);
