import type { SyncSource } from "./types"

/**
 * External data source configurations.
 *
 * To add a new source:
 * 1. Add a new entry to the sources array below
 * 2. Provide the URL to a JSON endpoint
 * 3. Optionally provide a transform function to map the data
 * 4. Set enabled: true to activate
 *
 * Trigger sync via: POST /api/sync
 * Or via cron: GET /api/sync  (check status)
 */

export function getSources(): SyncSource[] {
  return [
    {
      id: "loot-drop",
      name: "Loot Drop — The Startup Graveyard",
      url: "https://loot-drop.io/api/startups", // Update when API is available
      enabled: false,
      syncIntervalHours: 24,
      // transform: (data) => { ... } // Custom transform if needed
    },
    {
      id: "failory",
      name: "Failory — Startup Failure Stories",
      url: "https://failory.com/api/startups",
      enabled: false,
      syncIntervalHours: 24,
    },
    {
      id: "cbinsights",
      name: "CBInsights — Startup Death Data",
      url: "https://www.cbinsights.com/research/startup-failure-reasons/",
      enabled: false,
      syncIntervalHours: 0, // manual only — requires scraping, not JSON API
    },
    {
      id: "autopsy",
      name: "Autopsy.io — Startup Failure Database",
      url: "https://autopsy.io/api/startups",
      enabled: false,
      syncIntervalHours: 24,
    },
    {
      id: "custom-import",
      name: "Manual Data Import",
      url: "/api/sync/import",
      enabled: true,
      syncIntervalHours: 0,
    },
  ]
}
