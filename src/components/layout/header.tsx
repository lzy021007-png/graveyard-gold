"use client"

import Link from "next/link"
import { Skull, Globe } from "lucide-react"
import { buttonVariants } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useLang, type Lang } from "@/lib/i18n/language-context"

export function Header() {
  const { lang, setLang, t } = useLang()

  const toggleLang = () => {
    setLang(lang === "en" ? "zh" : "en")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-bold text-lg text-white">
          <Skull className="h-6 w-6 text-purple-400" />
          <span>Graveyard Gold</span>
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/analyze" className="text-neutral-400 hover:text-white transition-colors">
            {t("nav.analyze")}
          </Link>
          <Link href="/dashboard" className="text-neutral-400 hover:text-white transition-colors">
            {t("nav.dashboard")}
          </Link>
          <button
            onClick={toggleLang}
            className="text-neutral-400 hover:text-white transition-colors flex items-center gap-1"
            aria-label={t("lang.switch")}
            title={t("lang.switch")}
          >
            <Globe className="h-4 w-4" />
            <span className="hidden sm:inline text-xs">{t("lang.switch")}</span>
          </button>
          <Link
            href="/analyze"
            className={cn(buttonVariants({ size: "sm" }), "bg-purple-600 hover:bg-purple-500 text-white")}
          >
            {t("nav.scan")}
          </Link>
        </nav>
      </div>
    </header>
  )
}

export function Footer() {
  const { t, lang } = useLang()
  const isZh = lang === "zh"
  return (
    <footer className="border-t border-neutral-800 py-8 text-center text-sm text-neutral-500">
      <p>
        {t("footer.inspired")}{" "}
        <a
          href="https://www.loot-drop.io/"
          target="_blank"
          rel="noopener noreferrer"
          className="text-purple-400 hover:underline"
        >
          Loot Drop — The Startup Graveyard
        </a>
      </p>
      <p className="mt-1">{t("footer.tagline")}</p>
      <div className="mt-4 flex items-center justify-center gap-4 text-xs">
        <a href="/privacy" className="text-neutral-500 hover:text-neutral-300 transition-colors">
          {isZh ? "隐私政策" : "Privacy Policy"}
        </a>
        <span className="text-neutral-700">|</span>
        <a href="/terms" className="text-neutral-500 hover:text-neutral-300 transition-colors">
          {isZh ? "服务条款" : "Terms of Service"}
        </a>
      </div>
    </footer>
  )
}
