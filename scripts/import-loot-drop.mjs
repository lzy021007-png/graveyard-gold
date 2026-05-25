import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

const SUPABASE_URL = "https://lentxykytbylpxytluic.supabase.co"
const SUPABASE_KEY = "sb_publishable_W5UgIXv8SGHeo43duatMCw_0h8GbgCY"

const PAGE_SIZE = 500
const TOTAL = 1749

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms))
}

async function fetchAll() {
  const all = []
  for (let offset = 0; offset < TOTAL; offset += PAGE_SIZE) {
    const rangeEnd = Math.min(offset + PAGE_SIZE - 1, TOTAL - 1)
    console.log(`Fetching ${offset}-${rangeEnd} of ${TOTAL}...`)
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/startups?select=*&offset=${offset}&limit=${PAGE_SIZE}&order=id`,
      {
        headers: {
          apikey: SUPABASE_KEY,
          Authorization: `Bearer ${SUPABASE_KEY}`,
        },
      }
    )
    if (!res.ok) {
      console.error(`HTTP ${res.status}: ${await res.text()}`)
      break
    }
    const batch = await res.json()
    all.push(...batch)
    console.log(`  Got ${batch.length}, total so far: ${all.length}`)
    if (all.length >= TOTAL) break
    await sleep(300) // be polite
  }
  return all
}

function mapCategory(raw) {
  if (!raw) return "competition"
  const s = raw.toLowerCase().trim().replace(/[\s-]/g, "_")

  // Direct matches
  const direct = {
    competition: "competition",
    product_problems: "product_problems",
    unit_economics: "unit_economics",
    no_market_need: "no_market_need",
    run_out_of_cash: "run_out_of_cash",
    team_issues: "team_issues",
    regulatory: "regulatory",
    operations: "operations",
    pivot_gone_wrong: "pivot_gone_wrong",
    tech_failure: "tech_failure",
    legal_issues: "legal_issues",
    product_problem: "product_problems",
    market_need: "no_market_need",
    cash: "run_out_of_cash",
    team: "team_issues",
    legal: "legal_issues",
    tech: "tech_failure",
    regulation: "regulatory",
    operation: "operations",
    pivot: "pivot_gone_wrong",
    unit_economic: "unit_economics",
  }
  if (direct[s]) return direct[s]

  // Fuzzy matching
  if (/compet/i.test(s)) return "competition"
  if (/product|bug|quality|ux|feature/i.test(s)) return "product_problems"
  if (/unit.?econ|margin|cost|pric/i.test(s)) return "unit_economics"
  if (/market.*need|no.*demand|no.*market|timing/i.test(s)) return "no_market_need"
  if (/cash|burn|fund|capital|money|financ|run.*out|ran.*out/i.test(s)) return "run_out_of_cash"
  if (/team|founder|co.?founder|people|hiring|talent|dispute/i.test(s)) return "team_issues"
  if (/regulat|complian|policy|government/i.test(s)) return "regulatory"
  if (/operat|logistic|supply|scal/i.test(s)) return "operations"
  if (/pivot|change.*direction/i.test(s)) return "pivot_gone_wrong"
  if (/tech.*fail|infra|architecture|bug/i.test(s)) return "tech_failure"
  if (/lawsuit|ip|intellectual|patent|sue|fraud/i.test(s)) return "legal_issues"

  return "competition"
}

function mapMarketScore(raw) {
  const s = String(raw || "").toLowerCase()
  if (s === "high") return 8
  if (s === "medium" || s === "mid") return 5
  if (s === "low") return 3
  return 5
}

function mapTags(raw) {
  if (!raw) return []
  if (Array.isArray(raw)) return raw.map((t) => String(t).toLowerCase().replace(/\s+/g, "-"))
  return [String(raw).toLowerCase().replace(/\s+/g, "-")]
}

function transform(raw) {
  const theLoot = Array.isArray(raw.the_loot) ? raw.the_loot.map(String) : raw.the_loot ? [String(raw.the_loot)] : []

  return {
    id: String(raw.id),
    name: raw.name || "Unknown",
    description: (raw.condensed_value_prop || raw.description || "").slice(0, 300),
    industry: raw.sector || "Other",
    cause_of_death: raw.condensed_cause_of_death || raw.cause_of_death || "Unknown",
    death_category: mapCategory(raw.primary_cause_of_death || raw.cause_of_death),
    money_raised: raw.total_funding || 0,
    money_burned: raw.total_funding || 0,
    founded_year: raw.start_year || 0,
    died_year: raw.end_year || new Date().getFullYear(),
    country: raw.country || "Unknown",
    founder_count: Array.isArray(raw.founders) ? raw.founders.filter((f) => f !== "N/A").length || 1 : 1,
    employee_count: 0,
    lessons_learned: theLoot.length > 0 ? theLoot : ["No lessons recorded"],
    market_potential_score: mapMarketScore(raw.market_potential),
    rebuild_difficulty: raw.difficulty || 5,
    tags: mapTags(raw.product_type),
    created_at: raw.created_at || new Date().toISOString(),
  }
}

function generate(records) {
  const startups = records.map(transform)

  // Write merged JSON for dashboards
  const dataDir = path.resolve(__dirname, "..", "src", "data")
  fs.mkdirSync(dataDir, { recursive: true })
  const mergedPath = path.join(dataDir, "failed-startups-merged.json")
  fs.writeFileSync(mergedPath, JSON.stringify(startups, null, 2), "utf-8")
  console.log(`Wrote ${startups.length} startups to ${mergedPath}`)

  // Generate EN seed data TS file
  const lines = []
  lines.push('import type { FailedStartup } from "@/lib/types"')
  lines.push("")
  lines.push("export const failedStartupsEn: FailedStartup[] = [")
  for (const s of startups) {
    lines.push("  {")
    for (const [key, value] of Object.entries(s)) {
      if (Array.isArray(value)) {
        lines.push(`    ${key}: ${JSON.stringify(value)},`)
      } else if (typeof value === "string") {
        lines.push(`    ${key}: ${JSON.stringify(value)},`)
      } else {
        lines.push(`    ${key}: ${value},`)
      }
    }
    lines.push("  },")
  }
  lines.push("]")
  lines.push("")

  const seedPath = path.resolve(__dirname, "..", "src", "lib", "db", "seed-data-en.ts")
  fs.writeFileSync(seedPath, lines.join("\n"), "utf-8")
  console.log(`Wrote EN seed data to ${seedPath}`)

  // Stats
  const stats = {}
  for (const s of startups) {
    const cat = s.death_category
    if (!stats[cat]) {
      stats[cat] = { count: 0, total_funding: 0 }
    }
    stats[cat].count++
    stats[cat].total_funding += s.money_raised
  }

  const total = startups.length
  const sorted = Object.entries(stats).sort((a, b) => b[1].count - a[1].count)

  console.log("\nDeath category stats:")
  for (const [cat, info] of sorted) {
    const pct = ((info.count / total) * 100).toFixed(1)
    console.log(`  ${cat}: ${info.count} (${pct}%)`)
  }

  console.log(`\nTotal startups: ${total}`)
  console.log(`Total funding: $${(startups.reduce((sum, s) => sum + s.money_raised, 0) / 1e9).toFixed(1)}B`)
}

async function main() {
  console.log("=== Loot Drop Data Import ===\n")
  const records = await fetchAll()
  generate(records)
  console.log("\nDone!")
}

main().catch(console.error)
