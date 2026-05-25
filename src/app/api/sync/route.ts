import { NextRequest, NextResponse } from "next/server"
import { loadManifest, runFullSync, loadMergedStartups } from "@/lib/sync/sync-manager"
import { getSources } from "@/lib/sync/sources"

export async function GET(request: NextRequest) {
  const manifest = loadManifest()
  const merged = loadMergedStartups()
  const sources = getSources()

  return NextResponse.json({
    status: "ok",
    manifest,
    sourceConfigs: sources.map((s) => ({
      id: s.id,
      name: s.name,
      enabled: s.enabled,
      syncIntervalHours: s.syncIntervalHours,
    })),
    currentCount: merged.length,
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const sourceId = body.source as string | undefined

  let sources = getSources()
  if (sourceId) {
    sources = sources.filter((s) => s.id === sourceId)
    if (sources.length === 0) {
      return NextResponse.json({ error: `Unknown source: ${sourceId}` }, { status: 400 })
    }
  }

  const manifest = await runFullSync(sources)

  return NextResponse.json({
    status: "completed",
    manifest,
  })
}
