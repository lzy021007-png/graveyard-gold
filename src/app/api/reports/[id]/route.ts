import { NextRequest, NextResponse } from "next/server"
import { getSupabaseAdmin } from "@/lib/supabase/admin"
import fs from "fs"
import path from "path"

const REPORTS_DIR = path.join(process.cwd(), "src", "data", "reports")

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params

  // Try Supabase first, fall back to filesystem
  const supabase = getSupabaseAdmin()
  if (supabase) {
    const { data, error } = await supabase
      .from("reports")
      .select("*")
      .eq("id", id)
      .single()

    if (!error && data) {
      return NextResponse.json(data)
    }
    if (error && error.code !== "PGRST116") {
      console.warn("Supabase query failed, falling back to filesystem:", error.message)
    }
  }

  // Filesystem fallback
  const filePath = path.join(REPORTS_DIR, `${id}.json`)
  if (!fs.existsSync(filePath)) {
    return NextResponse.json({ error: "Report not found" }, { status: 404 })
  }

  try {
    const raw = fs.readFileSync(filePath, "utf-8")
    return NextResponse.json(JSON.parse(raw))
  } catch {
    return NextResponse.json({ error: "Failed to read report" }, { status: 500 })
  }
}
