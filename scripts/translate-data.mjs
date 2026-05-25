/**
 * Translates the 1,749 loot-drop records from English to Chinese.
 * Batches 20 records per API call to balance speed and cost.
 * Saves progress to disk so interrupted runs can resume.
 *
 * Usage: node scripts/translate-data.mjs
 */

import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, "..")
const MERGED_PATH = path.join(ROOT, "src", "data", "failed-startups-merged.json")
const OUTPUT_PATH = path.join(ROOT, "src", "data", "failed-startups-merged-zh.json")
const PROGRESS_PATH = path.join(ROOT, "src", "data", ".translate-progress.json")

// Load .env.local
function loadEnv() {
  const envPath = path.join(ROOT, ".env.local")
  if (!fs.existsSync(envPath)) return
  const lines = fs.readFileSync(envPath, "utf-8").split("\n")
  for (const line of lines) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith("#")) continue
    const eq = trimmed.indexOf("=")
    if (eq === -1) continue
    const key = trimmed.slice(0, eq)
    const value = trimmed.slice(eq + 1)
    if (!process.env[key]) process.env[key] = value
  }
}
loadEnv()

const API_KEY = process.env.ANTHROPIC_API_KEY
const API_BASE = process.env.ANTHROPIC_BASE_URL || "https://api.deepseek.com/anthropic"
const MODEL = "deepseek-v4-pro"
const BATCH_SIZE = 20
const DELAY_MS = 2000 // pause between batches

if (!API_KEY) {
  console.error("ANTHROPIC_API_KEY not set in environment")
  process.exit(1)
}

async function translateBatch(records) {
  const items = records.map((r) => ({
    name: r.name || "",
    description: (r.description || "").slice(0, 400),
    cause_of_death: (r.cause_of_death || "").slice(0, 400),
  }))

  const prompt = `Translate these ${items.length} startup failure records to Simplified Chinese. Return ONLY a JSON array of objects with "name", "description", and "cause_of_death" fields translated to natural, fluent Chinese. Keep company names in their original form unless they have a well-known Chinese name.

Records:
${JSON.stringify(items, null, 2)}

Return format: [{"name": "中文名", "description": "中文描述", "cause_of_death": "中文死因"}, ...]`

  const res = await fetch(`${API_BASE}/v1/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": API_KEY,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: MODEL,
      max_tokens: 4096,
      system: "You are a professional translator. Translate startup failure data from English to Simplified Chinese. Be concise and accurate. Return ONLY valid JSON.",
      thinking: { type: "disabled" },
      messages: [{ role: "user", content: prompt }],
    }),
  })

  if (!res.ok) {
    throw new Error(`API error ${res.status}: ${await res.text()}`)
  }

  const data = await res.json()
  const text = data.content?.find((c) => c.type === "text")?.text || ""
  const jsonMatch = text.match(/\[[\s\S]*\]/)
  if (!jsonMatch) {
    console.error("Failed to parse translation response:", text.slice(0, 200))
    return null
  }

  try {
    return JSON.parse(jsonMatch[0])
  } catch {
    console.error("Failed to parse translation JSON:", jsonMatch[0].slice(0, 200))
    return null
  }
}

function loadProgress() {
  try {
    return JSON.parse(fs.readFileSync(PROGRESS_PATH, "utf-8"))
  } catch {
    return { translated: 0 }
  }
}

function saveProgress(progress) {
  fs.writeFileSync(PROGRESS_PATH, JSON.stringify(progress), "utf-8")
}

async function main() {
  const allRecords = JSON.parse(fs.readFileSync(MERGED_PATH, "utf-8"))
  console.log(`Total records: ${allRecords.length}`)

  const progress = loadProgress()
  const translated = [...(progress.results || [])]
  let startIndex = progress.translated || 0

  if (startIndex > 0) {
    console.log(`Resuming from record ${startIndex}...`)
  }

  for (let i = startIndex; i < allRecords.length; i += BATCH_SIZE) {
    const batch = allRecords.slice(i, i + BATCH_SIZE)
    const batchNum = Math.floor(i / BATCH_SIZE) + 1
    const totalBatches = Math.ceil(allRecords.length / BATCH_SIZE)

    console.log(`\nBatch ${batchNum}/${totalBatches} (records ${i + 1}-${Math.min(i + BATCH_SIZE, allRecords.length)})...`)

    let result = null
    for (let attempt = 0; attempt < 3; attempt++) {
      try {
        result = await translateBatch(batch)
        if (result) break
      } catch (err) {
        console.error(`  Attempt ${attempt + 1} failed:`, err.message)
        if (attempt < 2) {
          console.log("  Retrying in 5s...")
          await new Promise((r) => setTimeout(r, 5000))
        }
      }
    }

    if (!result) {
      console.error("  Batch failed after 3 attempts, saving progress and stopping.")
      saveProgress({ translated: i, results: translated })
      process.exit(1)
    }

    // Merge translations into records
    for (let j = 0; j < batch.length && j < result.length; j++) {
      const orig = { ...batch[j] }
      orig.name = result[j].name || orig.name
      orig.description = result[j].description || orig.description
      orig.cause_of_death = result[j].cause_of_death || orig.cause_of_death
      translated.push(orig)
    }

    // Save progress
    saveProgress({ translated: i + BATCH_SIZE, results: translated })
    console.log(`  Done. ${translated.length}/${allRecords.length} translated.`)

    // Be polite to the API
    if (i + BATCH_SIZE < allRecords.length) {
      await new Promise((r) => setTimeout(r, DELAY_MS))
    }
  }

  // Write final output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(translated, null, 2), "utf-8")
  console.log(`\nDone! ${translated.length} records written to ${OUTPUT_PATH}`)

  // Clean up progress file
  try { fs.unlinkSync(PROGRESS_PATH) } catch {}
}

main().catch(console.error)
