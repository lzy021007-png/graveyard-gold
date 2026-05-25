import type { FailedStartup } from "@/lib/types"

export interface SyncSource {
  id: string
  name: string
  url: string
  enabled: boolean
  /** Transform raw data from this source into FailedStartup[] */
  transform?: (data: unknown) => FailedStartup[]
  /** How often to sync (in hours). 0 = manual only */
  syncIntervalHours: number
}

export interface SyncManifest {
  lastSyncAt: string | null
  sources: {
    sourceId: string
    lastSyncAt: string | null
    itemsSynced: number
    error?: string
  }[]
  totalStartups: number
}
