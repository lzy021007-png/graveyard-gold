import { NextResponse } from "next/server"
import { loadMergedStartups, loadMergedStartupsZh, loadManifest } from "@/lib/sync/sync-manager"
import {
  failedStartups as seedData,
  failedStartupsEn as seedDataEn,
  deathCategoryStatsZh,
  deathCategoryStatsEn,
  industryPatternsZh,
  industryPatternsEn,
} from "@/lib/db/seed-data"

export async function GET() {
  const merged = loadMergedStartups()
  const mergedZh = loadMergedStartupsZh()
  const manifest = loadManifest()

  return NextResponse.json({
    startups: merged,
    startupsZh: mergedZh,
    statsZh: deathCategoryStatsZh,
    statsEn: deathCategoryStatsEn,
    industryPatternsZh,
    industryPatternsEn,
    totalCount: merged.length,
    lastSyncAt: manifest.lastSyncAt,
    isExpanded: merged.length > seedData.length,
  })
}
