// Google Analytics event tracking
// Uses gtag which is loaded in the root layout

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void
  }
}

function track(event: string, params?: Record<string, string | number>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, params)
  }
}

export const analytics = {
  analyzeStarted(mode: 'full' | 'quick', hasIndustry: boolean, hasStage: boolean) {
    track('analyze_started', {
      mode,
      has_industry: hasIndustry ? '1' : '0',
      has_stage: hasStage ? '1' : '0',
    })
  },

  analyzeCompleted(mode: 'full' | 'quick', riskScore: number, durationMs: number) {
    track('analyze_completed', {
      mode,
      risk_score: riskScore,
      duration_ms: durationMs,
    })
  },

  analyzeFailed(mode: 'full' | 'quick', error: string) {
    track('analyze_failed', { mode, error: error.slice(0, 100) })
  },

  reportViewed(reportId: string) {
    track('report_viewed', { report_id: reportId })
  },

  reportShared(reportId: string) {
    track('report_shared', { report_id: reportId })
  },

  quickExit(durationMs: number) {
    track('quick_exit', { duration_ms: durationMs })
  },

  languageSwitched(lang: string) {
    track('language_switched', { lang })
  },

  exampleClicked(index: number) {
    track('example_clicked', { index })
  },
}
