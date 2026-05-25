import { NextRequest, NextResponse } from "next/server"
import { loadMergedStartups, loadManifest } from "@/lib/sync/sync-manager"
import type { FailedStartup, DeathCategory } from "@/lib/types"
import fs from "fs"
import path from "path"

const DATA_DIR = path.join(process.cwd(), "src", "data")
const MERGED_FILE = path.join(DATA_DIR, "failed-startups-merged.json")
const MANIFEST_FILE = path.join(DATA_DIR, "sync-manifest.json")

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const startups = Array.isArray(body) ? body : body.startups

    if (!Array.isArray(startups) || startups.length === 0) {
      return NextResponse.json(
        { error: "Expected JSON array of startups, or { startups: [...] }" },
        { status: 400 }
      )
    }

    ensureDataDir()

    // Load existing data
    const existing = loadMergedStartups()
    const existingNames = new Set(existing.map((s) => s.name.toLowerCase().trim()))

    let added = 0
    let skipped = 0

    const newStartups: FailedStartup[] = []
    for (const item of startups) {
      const name = (item.name || "").toLowerCase().trim()
      if (!name) {
        skipped++
        continue
      }
      if (existingNames.has(name)) {
        skipped++
        continue
      }
      existingNames.add(name)

      newStartups.push({
        id: `import-${Date.now()}-${added}`,
        name: item.name || `Unknown-${added}`,
        description: item.description || "",
        industry: item.industry || "Other",
        cause_of_death: item.cause_of_death || "",
        death_category: (item.death_category || "competition") as DeathCategory,
        money_raised: Number(item.money_raised || 0),
        money_burned: Number(item.money_burned || 0),
        founded_year: Number(item.founded_year || 0),
        died_year: Number(item.died_year || 0),
        country: item.country || "Unknown",
        founder_count: Number(item.founder_count || 1),
        employee_count: Number(item.employee_count || 0),
        lessons_learned: Array.isArray(item.lessons_learned)
          ? item.lessons_learned
          : item.lessons_learned ? [item.lessons_learned] : [],
        market_potential_score: Number(item.market_potential_score || 5),
        rebuild_difficulty: Number(item.rebuild_difficulty || 5),
        tags: Array.isArray(item.tags) ? item.tags : [],
        created_at: item.created_at || new Date().toISOString(),
      })
      added++
    }

    const merged = [...existing, ...newStartups]
    fs.writeFileSync(MERGED_FILE, JSON.stringify(merged, null, 2), "utf-8")

    // Update manifest
    const manifest = loadManifest()
    manifest.lastSyncAt = new Date().toISOString()
    manifest.totalStartups = merged.length
    fs.writeFileSync(MANIFEST_FILE, JSON.stringify(manifest, null, 2), "utf-8")

    return NextResponse.json({
      status: "ok",
      added,
      skipped,
      total: merged.length,
    })
  } catch (err) {
    return NextResponse.json(
      { error: `Import failed: ${(err as Error).message}` },
      { status: 500 }
    )
  }
}
