import type { FailedStartup, DeathCategory } from "@/lib/types"
import type { SyncSource, SyncManifest } from "./types"
import { failedStartups as seedData } from "@/lib/db/seed-data"
import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "src", "data")
const MERGED_FILE = path.join(DATA_DIR, "failed-startups-merged.json")
const MERGED_FILE_ZH = path.join(DATA_DIR, "failed-startups-merged-zh.json")
const MANIFEST_FILE = path.join(DATA_DIR, "sync-manifest.json")

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export function loadMergedStartups(): FailedStartup[] {
  ensureDataDir()
  if (fs.existsSync(MERGED_FILE)) {
    try {
      const raw = fs.readFileSync(MERGED_FILE, "utf-8")
      return JSON.parse(raw)
    } catch {
      console.warn("Failed to read merged startups, using seed data")
    }
  }
  return seedData
}

export function loadMergedStartupsZh(): FailedStartup[] {
  ensureDataDir()
  if (fs.existsSync(MERGED_FILE_ZH)) {
    try {
      const raw = fs.readFileSync(MERGED_FILE_ZH, "utf-8")
      return JSON.parse(raw)
    } catch {
      console.warn("Failed to read Chinese merged startups")
    }
  }
  // Fall back to English merged, then Chinese seed data
  return loadMergedStartups()
}

export function loadManifest(): SyncManifest {
  ensureDataDir()
  if (fs.existsSync(MANIFEST_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(MANIFEST_FILE, "utf-8"))
    } catch {
      // fall through
    }
  }
  return {
    lastSyncAt: null,
    sources: [],
    totalStartups: seedData.length,
  }
}

function saveManifest(manifest: SyncManifest) {
  ensureDataDir()
  fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), "utf-8")
}

function saveMerged(startups: FailedStartup[]) {
  ensureDataDir()
  fs.writeFileSync(MERGED_FILE, JSON.stringify(startups, null, 2), "utf-8")
}

function deduplicateByName(startups: FailedStartup[]): FailedStartup[] {
  const seen = new Map<string, FailedStartup>()
  for (const s of startups) {
    const key = s.name.toLowerCase().trim()
    const existing = seen.get(key)
    if (!existing || (s.id && !existing.id)) {
      // Prefer entries with more data (non-empty id, more tags, etc.)
      if (!existing || (s.tags?.length || 0) > (existing.tags?.length || 0)) {
        seen.set(key, s)
      }
    }
  }
  return Array.from(seen.values())
}

function normalizeExternalData(raw: unknown, sourceId: string): FailedStartup[] {
  if (!Array.isArray(raw)) {
    console.warn(`Source ${sourceId}: expected array, got ${typeof raw}`)
    return []
  }

  return raw.map((item: Record<string, unknown>, i: number) => ({
    id: `ext-${sourceId}-${item.id || i}`,
    name: String(item.name || item.company || item.title || `Unknown-${i}`),
    description: String(item.description || item.summary || item.story || ""),
    industry: String(item.industry || item.category || item.sector || "Other"),
    cause_of_death: String(item.cause_of_death || item.cause || item.death_reason || "Unknown"),
    death_category: normalizeCategory(item.death_category || item.category || item.death_type) as DeathCategory,
    money_raised: Number(item.money_raised || item.total_funding || item.funding || 0),
    money_burned: Number(item.money_burned || item.amount_lost || item.burned || item.money_raised || 0),
    founded_year: Number(item.founded_year || item.year_founded || item.founded || 0),
    died_year: Number(item.died_year || item.year_died || item.died || item.closed_year || new Date().getFullYear()),
    country: String(item.country || item.location || item.hq || "Unknown"),
    founder_count: Number(item.founder_count || item.founders || 1),
    employee_count: Number(item.employee_count || item.employees || item.team_size || 0),
    lessons_learned: Array.isArray(item.lessons_learned)
      ? item.lessons_learned.map(String)
      : item.lesson ? [String(item.lesson)] : [],
    market_potential_score: Number(item.market_potential_score || item.market_score || 5),
    rebuild_difficulty: Number(item.rebuild_difficulty || item.difficulty || 5),
    tags: Array.isArray(item.tags) ? item.tags.map(String) : [],
    created_at: String(item.created_at || new Date().toISOString()),
  }))
}

function normalizeCategory(raw: unknown): DeathCategory {
  const validCategories: DeathCategory[] = [
    "product_problems", "competition", "unit_economics",
    "no_market_need", "run_out_of_cash", "team_issues",
    "regulatory", "operations", "pivot_gone_wrong",
    "tech_failure", "legal_issues",
  ]
  const s = String(raw || "").toLowerCase().replace(/[\s-]/g, "_")
  if (validCategories.includes(s as DeathCategory)) return s as DeathCategory

  const fuzzy: Record<string, DeathCategory> = {
    product: "product_problems",
    compete: "competition",
    economics: "unit_economics",
    market: "no_market_need",
    cash: "run_out_of_cash",
    team: "team_issues",
    reg: "regulatory",
    ops: "operations",
    pivot: "pivot_gone_wrong",
    tech: "tech_failure",
    legal: "legal_issues",
  }
  for (const [key, value] of Object.entries(fuzzy)) {
    if (s.includes(key)) return value
  }
  return "competition"
}

export async function syncSource(source: SyncSource): Promise<{ items: number; error?: string }> {
  try {
    const res = await fetch(source.url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(30000),
    })
    if (!res.ok) {
      return { items: 0, error: `HTTP ${res.status}: ${res.statusText}` }
    }
    const raw = await res.json()
    const items = source.transform
      ? source.transform(raw)
      : normalizeExternalData(raw, source.id)

    return { items: items.length }
  } catch (err) {
    return { items: 0, error: (err as Error).message }
  }
}

export async function runFullSync(sources: SyncSource[]): Promise<SyncManifest> {
  const manifest = loadManifest()
  const now = new Date().toISOString()
  const enabledSources = sources.filter((s) => s.enabled)
  let allStartups = [...seedData]

  for (const source of enabledSources) {
    const result = await syncSource(source)
    manifest.sources = manifest.sources.filter((s) => s.sourceId !== source.id)
    manifest.sources.push({
      sourceId: source.id,
      lastSyncAt: now,
      itemsSynced: result.items,
      error: result.error,
    })

    if (result.items > 0 && !result.error) {
      try {
        const res = await fetch(source.url, {
          headers: { Accept: "application/json" },
          signal: AbortSignal.timeout(30000),
        })
        const raw = await res.json()
        const external = source.transform
          ? source.transform(raw)
          : normalizeExternalData(raw, source.id)
        allStartups = [...allStartups, ...external]
      } catch {
        // skip if re-fetch fails
      }
    }
  }

  const merged = deduplicateByName(allStartups)
  manifest.lastSyncAt = now
  manifest.totalStartups = merged.length
  saveMerged(merged)
  saveManifest(manifest)

  return manifest
}
