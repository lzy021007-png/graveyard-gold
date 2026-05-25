"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Skull, ArrowLeft } from "lucide-react"
import { useLang } from "@/lib/i18n/language-context"

export default function NotFoundPage() {
  let isZh = false
  try {
    const ctx = useLang()
    isZh = ctx.lang === "zh"
  } catch {
    // useLang not available at this level
  }

  return (
    <main className="flex-1 flex items-center justify-center px-4 py-24">
      <div className="text-center max-w-md">
        <Skull className="h-16 w-16 text-purple-400 mx-auto mb-4 opacity-50" />
        <h1 className="text-6xl font-black text-neutral-800 mb-2">404</h1>
        <p className="text-lg text-neutral-400 mb-2">
          {isZh ? "页面未找到" : "Page not found"}
        </p>
        <p className="text-sm text-neutral-600 mb-8">
          {isZh
            ? "这个页面不存在。也许它像一家失败的创业公司一样消失了。"
            : "This page doesn't exist. Maybe it died like a failed startup."}
        </p>
        <Link
          href="/"
          className={buttonVariants({ variant: "outline" })}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {isZh ? "返回创业墓地" : "Back to Graveyard Gold"}
        </Link>
      </div>
    </main>
  )
}
