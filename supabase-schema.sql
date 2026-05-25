-- Run this in Supabase SQL Editor to set up the database

-- Failed startups table
CREATE TABLE failed_startups (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  industry TEXT,
  cause_of_death TEXT,
  death_category TEXT,
  money_raised BIGINT DEFAULT 0,
  money_burned BIGINT DEFAULT 0,
  founded_year INTEGER,
  died_year INTEGER,
  country TEXT,
  founder_count INTEGER DEFAULT 1,
  employee_count INTEGER DEFAULT 0,
  lessons_learned TEXT[] DEFAULT '{}',
  market_potential_score INTEGER CHECK (market_potential_score >= 1 AND market_potential_score <= 10),
  rebuild_difficulty INTEGER CHECK (rebuild_difficulty >= 1 AND rebuild_difficulty <= 10),
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analysis reports table
CREATE TABLE analysis_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id),
  idea_summary TEXT NOT NULL,
  industry TEXT,
  business_model TEXT,
  target_market TEXT,
  overall_risk_score INTEGER,
  viability_score INTEGER,
  difficulty_rating INTEGER CHECK (difficulty_rating >= 1 AND difficulty_rating <= 5),
  monetization_timeline_months INTEGER,
  risk_factors JSONB DEFAULT '[]',
  competitor_analysis TEXT,
  unit_economics_assessment TEXT,
  action_plan TEXT[] DEFAULT '{}',
  original_idea TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User profiles table
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT,
  reports_generated INTEGER DEFAULT 0,
  subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'pro', 'enterprise')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_failed_startups_industry ON failed_startups(industry);
CREATE INDEX idx_failed_startups_death_category ON failed_startups(death_category);
CREATE INDEX idx_analysis_reports_user_id ON analysis_reports(user_id);
CREATE INDEX idx_analysis_reports_created_at ON analysis_reports(created_at);

-- Enable Row Level Security
ALTER TABLE failed_startups ENABLE ROW LEVEL SECURITY;
ALTER TABLE analysis_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies: anyone can read failed startups
CREATE POLICY "Failed startups are publicly readable"
  ON failed_startups FOR SELECT
  USING (true);

-- Users can read their own reports
CREATE POLICY "Users can read own reports"
  ON analysis_reports FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own reports
CREATE POLICY "Users can insert own reports"
  ON analysis_reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can read their own profile
CREATE POLICY "Users can read own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to auto-create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
