"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { useLang } from "@/lib/i18n/language-context"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  // Error boundary may render outside LanguageProvider — guard gently
  let isZh = false
  try {
    const ctx = useLang()
    isZh = ctx.lang === "zh"
  } catch {
    // useLang not available at this level
  }

  useEffect(() => {
    console.error("App error:", error)
  }, [error])

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-md">
        <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
        <h1 className="text-xl font-bold mb-2">
          {isZh ? "出了点问题" : "Something went wrong"}
        </h1>
        <p className="text-sm text-neutral-400 mb-6">
          {isZh
            ? "发生了意外错误。已记录日志，我们会尽快处理。"
            : "An unexpected error occurred. This has been logged and we'll look into it."}
        </p>
        <Button onClick={reset} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" /> {isZh ? "重试" : "Try Again"}
        </Button>
      </div>
    </main>
  )
}
