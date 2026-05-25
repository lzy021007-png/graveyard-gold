import Anthropic from '@anthropic-ai/sdk'
import { SYSTEM_PROMPT, buildUserPrompt } from './prompts'
import { failedStartups } from '@/lib/db/seed-data'
import type { AnalysisReport, RiskFactor, FailedStartup, DeathCategory } from '@/lib/types'

const CATEGORY_ALIASES: Record<string, DeathCategory> = {
  competition: 'competition',
  product_problems: 'product_problems',
  unit_economics: 'unit_economics',
  no_market_need: 'no_market_need',
  run_out_of_cash: 'run_out_of_cash',
  team_issues: 'team_issues',
  regulatory: 'regulatory',
  operations: 'operations',
  pivot_gone_wrong: 'pivot_gone_wrong',
  tech_failure: 'tech_failure',
  legal_issues: 'legal_issues',
}

const CATEGORY_FUZZY: [RegExp, DeathCategory][] = [
  [/compet/i, 'competition'],
  [/product|bug|quality|ux/i, 'product_problems'],
  [/unit.?econ|margin|cost|pric/i, 'unit_economics'],
  [/market.*need|no.*demand|no.*market|customer.*need|problem.*exist/i, 'no_market_need'],
  [/cash|burn|fund|capital|money|financ/i, 'run_out_of_cash'],
  [/team|founder|co.?founder|people|hiring|talent/i, 'team_issues'],
  [/regulat|complian|policy|legal.*law|government/i, 'regulatory'],
  [/operat|logistic|supply|scal|customer.*support/i, 'operations'],
  [/pivot|change.*direction|wrong.*turn/i, 'pivot_gone_wrong'],
  [/tech.*fail|infra|architecture|scalab/i, 'tech_failure'],
  [/lawsuit|ip|intellectual|patent|sue/i, 'legal_issues'],
]

function normalizeCategory(raw: string): DeathCategory {
  const key = raw.toLowerCase().trim()
  if (CATEGORY_ALIASES[key]) return CATEGORY_ALIASES[key]
  for (const [regex, category] of CATEGORY_FUZZY) {
    if (regex.test(key)) return category
  }
  return 'competition' // safe default
}

function normalizeSeverity(raw: string): 'high' | 'medium' | 'low' {
  const s = raw.toLowerCase().trim()
  if (s === 'high' || s === 'critical' || s === 'severe') return 'high'
  if (s === 'medium' || s === 'moderate' || s === 'mid') return 'medium'
  return 'low'
}

function normalizeRiskFactors(factors: RiskFactor[]): RiskFactor[] {
  return factors.map((r) => ({
    ...r,
    category: normalizeCategory(r.category),
    severity: normalizeSeverity(r.severity),
  }))
}

function getAnthropicClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('AI service is not configured')
  }
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
  })
}

function matchSimilarStartups(riskFactors: RiskFactor[]): FailedStartup[] {
  const allNames = new Set(riskFactors.flatMap((r) => r.similar_cases))
  return failedStartups.filter((s) => allNames.has(s.name))
}

function extractText(content: Anthropic.Messages.ContentBlock[]): string {
  const textBlock = content.find((block): block is Anthropic.Messages.TextBlock => block.type === 'text')
  return textBlock?.text ?? ''
}

export async function analyzeIdea(
  idea: string,
  industry?: string,
  stage?: string
): Promise<AnalysisReport> {
  const anthropic = getAnthropicClient()
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'deepseek-v4-pro',
    max_tokens: 8192,
    system: SYSTEM_PROMPT,
    thinking: { type: 'disabled' as const },
    messages: [
      {
        role: 'user',
        content: buildUserPrompt(idea, industry, stage),
      },
    ],
  })

  const text = extractText(response.content)

  // Extract JSON from response (handle potential markdown wrapping)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('Failed to parse AI response (length: %d)', text.length)
    throw new Error('Failed to parse AI response')
  }

  const analysis = JSON.parse(jsonMatch[0])

  return {
    id: crypto.randomUUID(),
    user_id: '',
    idea_summary: analysis.idea_summary,
    industry: analysis.industry,
    business_model: analysis.business_model,
    target_market: analysis.target_market,
    overall_risk_score: analysis.overall_risk_score,
    viability_score: analysis.viability_score,
    difficulty_rating: analysis.difficulty_rating,
    monetization_timeline_months: analysis.monetization_timeline_months,
    risk_factors: normalizeRiskFactors(analysis.risk_factors),
    similar_failed_startups: matchSimilarStartups(analysis.risk_factors),
    competitor_analysis: analysis.competitor_analysis,
    unit_economics_assessment: analysis.unit_economics_assessment,
    action_plan: analysis.action_plan,
    created_at: new Date().toISOString(),
  }
}

// Lightweight function for bulk/quick analysis
export async function quickScan(idea: string): Promise<{
  risk_score: number
  top_3_risks: RiskFactor[]
  verdict: string
}> {
  const anthropic = getAnthropicClient()
  const response = await anthropic.messages.create({
    model: process.env.ANTHROPIC_HAIKU_MODEL || 'deepseek-v4-pro',
    max_tokens: 2048,
    system: `You are a fast startup risk scanner. Analyze the idea and return ONLY valid JSON. Use ONLY these category values: "competition", "product_problems", "unit_economics", "no_market_need", "run_out_of_cash", "team_issues", "regulatory", "operations", "pivot_gone_wrong", "tech_failure", "legal_issues". Severity must be "high", "medium", or "low".`,
    thinking: { type: 'disabled' as const },
    messages: [
      {
        role: 'user',
        content: `Quickly scan this startup idea for the top 3 failure risks. Return JSON: { "risk_score": number 0-100, "top_3_risks": [{ "category": "...", "severity": "high|medium|low", "probability": number, "explanation": "...", "mitigation": [...] }], "verdict": "one sentence verdict" }\n\nIDEA: ${idea}`,
      },
    ],
  })

  const text = extractText(response.content)
  const jsonMatch = text.match(/\{[\s\S]*\}/)
  if (!jsonMatch) {
    console.error('Failed to parse quick scan response (length: %d)', text.length)
    throw new Error('Failed to parse quick scan response')
  }

  const result = JSON.parse(jsonMatch[0])
  result.top_3_risks = normalizeRiskFactors(result.top_3_risks)
  return result
}
