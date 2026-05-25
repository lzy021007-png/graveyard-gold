import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import fs from "fs"
import path from "path"
import crypto from "crypto"

const REPORTS_DIR = path.join(process.cwd(), "src", "data", "reports")

function ensureDir() {
  if (!fs.existsSync(REPORTS_DIR)) {
    fs.mkdirSync(REPORTS_DIR, { recursive: true })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    if (!body || typeof body.overall_risk_score !== "number") {
      return NextResponse.json({ error: "Invalid report data" }, { status: 400 })
    }

    const id = crypto.randomUUID()
    const report = { id, ...body, created_at: body.created_at || new Date().toISOString() }

    // Try Supabase first, fall back to filesystem
    const supabase = getSupabaseAdmin()
    if (supabase) {
      const { error } = await supabase.from("reports").insert(report)
      if (!error) {
        return NextResponse.json({ id, url: `/report/${id}` })
      }
      console.warn("Supabase insert failed, falling back to filesystem:", error.message)
    }

    // Filesystem fallback
    ensureDir()
    fs.writeFileSync(
      path.join(REPORTS_DIR, `${id}.json`),
      JSON.stringify(report, null, 2),
      "utf-8"
    )

    return NextResponse.json({ id, url: `/report/${id}` })
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to save report" },
      { status: 500 }
    )
  }
}
