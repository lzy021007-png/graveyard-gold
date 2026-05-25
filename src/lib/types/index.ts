export interface FailedStartup {
  id: string
  name: string
  description: string
  industry: string
  cause_of_death: string
  death_category: DeathCategory
  money_raised: number
  money_burned: number
  founded_year: number
  died_year: number
  country: string
  founder_count: number
  employee_count: number
  lessons_learned: string[]
  market_potential_score: number
  rebuild_difficulty: number
  tags: string[]
  created_at: string
}

export type DeathCategory =
  | 'product_problems'
  | 'competition'
  | 'unit_economics'
  | 'no_market_need'
  | 'run_out_of_cash'
  | 'team_issues'
  | 'regulatory'
  | 'operations'
  | 'pivot_gone_wrong'
  | 'tech_failure'
  | 'legal_issues'

export const DEATH_CATEGORY_LABELS_ZH: Record<DeathCategory, string> = {
  product_problems: '产品问题',
  competition: '竞争淘汰',
  unit_economics: '单位经济崩塌',
  no_market_need: '没有市场需求',
  run_out_of_cash: '现金流断裂',
  team_issues: '团队问题',
  regulatory: '监管/政策',
  operations: '运营失控',
  pivot_gone_wrong: '转型失败',
  tech_failure: '技术故障',
  legal_issues: '法律问题',
}

export const DEATH_CATEGORY_LABELS_EN: Record<DeathCategory, string> = {
  product_problems: 'Product Problems',
  competition: 'Competition',
  unit_economics: 'Unit Economics',
  no_market_need: 'No Market Need',
  run_out_of_cash: 'Run Out of Cash',
  team_issues: 'Team Issues',
  regulatory: 'Regulatory',
  operations: 'Operations',
  pivot_gone_wrong: 'Pivot Gone Wrong',
  tech_failure: 'Tech Failure',
  legal_issues: 'Legal Issues',
}

export function getDeathCategoryLabel(cat: DeathCategory, lang: string): string {
  return lang === 'zh' ? DEATH_CATEGORY_LABELS_ZH[cat] : DEATH_CATEGORY_LABELS_EN[cat]
}

export interface RiskFactor {
  category: DeathCategory
  severity: 'high' | 'medium' | 'low'
  probability: number // 0-100
  explanation: string
  similar_cases: string[]
  mitigation: string[]
}

export interface AnalysisReport {
  id: string
  user_id: string
  idea_summary: string
  industry: string
  business_model: string
  target_market: string
  overall_risk_score: number // 0-100
  risk_factors: RiskFactor[]
  similar_failed_startups: FailedStartup[]
  competitor_analysis: string
  unit_economics_assessment: string
  action_plan: string[]
  viability_score: number // 0-100
  difficulty_rating: 1 | 2 | 3 | 4 | 5
  monetization_timeline_months: number
  created_at: string
}

export interface UserProfile {
  id: string
  email: string
  reports_generated: number
  subscription_tier: 'free' | 'pro' | 'enterprise'
  created_at: string
}
