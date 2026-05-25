"use client"

import { createContext, useContext, useState, useCallback, useEffect, type ReactNode } from "react"

export type Lang = "en" | "zh"

type LanguageContextType = {
  lang: Lang
  setLang: (l: Lang) => void
  t: (key: string) => string
}

const LanguageContext = createContext<LanguageContextType | null>(null)

const translations: Record<Lang, Record<string, string>> = {
  en: {
    "nav.analyze": "Analyze",
    "nav.dashboard": "Dashboard",
    "nav.scan": "Scan Your Idea →",
    "hero.badge": "POWERED BY 1,749 FAILED STARTUPS",
    "hero.title1": "Before You Quit Your Job,",
    "hero.title2": "Let 1,749 Dead Startups",
    "hero.title3": "Review Your Idea.",
    "hero.subtitle": "AI-powered startup idea validation. We compare your idea against real failure patterns from startup history — and tell you exactly how to survive.",
    "hero.scan": "Scan Your Idea Free",
    "hero.how": "How It Works",
    "hero.lethality": "lethality rate",
    "stats.label": "DATA FROM THE STARTUP GRAVEYARD",
    "stats.failed": "Failed Startups",
    "stats.burned": "Burned",
    "stats.patterns": "Death Patterns",
    "how.title": "How It Works",
    "how.subtitle": "Four steps from idea to validated plan. Takes less than 3 minutes.",
    "how.step1.title": "Describe Your Idea",
    "how.step1.desc": "Write 100–300 words about your startup idea. The more detail, the better the analysis.",
    "how.step2.title": "AI Deep Scan",
    "how.step2.desc": "AI cross-references your idea against 1,749 failure patterns in under 30 seconds.",
    "how.step3.title": "Get Risk Report",
    "how.step3.desc": "An 8–12 page structured report: risk matrix, similar failures, survival action plan.",
    "how.step4.title": "Iterate & Improve",
    "how.step4.desc": "Refine your idea based on the report, re-scan, until risk is manageable.",
    "why.title": "Why It Works",
    "why.subtitle": "Built on patterns from the largest startup failure database ever assembled.",
    "comp.title": "The Competition Gap",
    "comp.subtitle": "Nobody does what we do — validate ideas against real failure data.",
    "cta.title": "Don't Become #1,701.",
    "cta.subtitle": "Most founders don't fail because their idea was bad. They fail because they never checked whether their idea would survive. Be the exception.",
    "cta.button": "Scan My Idea — It's Free",
    "analyze.title": "Validate Your Startup Idea",
    "analyze.subtitle": "Describe your idea below. Our AI will cross-reference it against 1,749 failed startups and give you an honest assessment.",
    "analyze.placeholder": "Describe your startup idea in detail. Include: what problem it solves, who it's for, how it makes money, and how it works. The more detail, the better the analysis.",
    "analyze.industry": "Industry (optional)",
    "analyze.stage": "Current Stage (optional)",
    "analyze.full": "Full Report",
    "analyze.quick": "Quick Scan",
    "analyze.full.desc": "Deep analysis: 11 death patterns, competitor assessment, unit economics check, action plan. ~30 seconds.",
    "analyze.quick.desc": "Fast scan: risk score + top 3 threats. ~5 seconds.",
    "analyze.button": "Analyze My Idea",
    "analyze.analyzing": "Analyzing...",
    "analyze.examples": "Try an Example",
    "analyze.whatYouGet": "What You'll Get",
    "analyze.streaming.title": "Analysis in Progress",
    "analyze.streaming.subtitle": "Analyzing your idea against 1,749 failure patterns...",
    "analyze.streaming.viewReport": "View Full Report",
    "analyze.streaming.newAnalysis": "New Analysis",
    "report.back": "New Analysis",
    "report.loading": "Loading report...",
    "report.notFound": "No Report Found",
    "report.expired": "The report may have expired. Please run a new analysis.",
    "report.analyzeNew": "Analyze New Idea",
    "report.riskScore": "Risk Score",
    "report.viability": "Viability",
    "report.difficulty": "Difficulty",
    "report.timeToRevenue": "Time to Revenue",
    "report.riskAnalysis": "Risk Analysis",
    "report.competitor": "Competitor Analysis",
    "report.unitEconomics": "Unit Economics Assessment",
    "report.actionPlan": "Survival Action Plan",
    "report.scanAgain": "Scan Again",
    "dashboard.title": "The Failure Database",
    "dashboard.subtitle": "Explore 1,749 failed startups. Filter by industry, death cause, or search.",
    "dashboard.explore": "Explore Cases",
    "dashboard.stats": "Death Stats",
    "dashboard.industry": "Industry Patterns",
    "dashboard.ready": "Ready to validate your own idea against these patterns?",
    "dashboard.analyze": "Analyze My Idea",
    "footer.inspired": "Inspired by",
    "footer.tagline": "One founder's failure is another founder's treasure.",
    "lang.switch": "中文",
  },
  zh: {
    "nav.analyze": "分析",
    "nav.dashboard": "数据库",
    "nav.scan": "分析我的想法 →",
    "hero.badge": "基于 1,749 失败案例的数据洞察",
    "hero.title1": "在你辞职之前，",
    "hero.title2": "先让 1,749 个失败案例",
    "hero.title3": "审查你的想法。",
    "hero.subtitle": "AI 驱动的创业想法验证平台。我们将你的想法与历史上真实的失败模式进行比对——并告诉你如何活下来。",
    "hero.scan": "免费分析你的想法",
    "hero.how": "工作原理",
    "hero.lethality": "致命率",
    "stats.label": "来自创业墓地的数据",
    "stats.failed": "失败案例",
    "stats.burned": "烧掉资金",
    "stats.patterns": "死亡模式",
    "how.title": "工作原理",
    "how.subtitle": "从想法到验证计划，只需四步，不到 3 分钟。",
    "how.step1.title": "描述你的想法",
    "how.step1.desc": "用 100–300 字描述你的创业想法。越详细，分析越精准。",
    "how.step2.title": "AI 深度扫描",
    "how.step2.desc": "AI 在 30 秒内将你的想法与 1,749 失败模式交叉比对。",
    "how.step3.title": "获取风险报告",
    "how.step3.desc": "一份 8–12 页的结构化报告：风险矩阵、相似失败案例、生存行动计划。",
    "how.step4.title": "迭代改进",
    "how.step4.desc": "根据报告优化想法，重新扫描，直到风险可控——然后再考虑辞职。",
    "why.title": "为什么有效",
    "why.subtitle": "建立在有史以来最大的创业失败数据库的分析模式之上。",
    "comp.title": "竞争空白",
    "comp.subtitle": "没人做我们在做的事——用真实失败数据验证创业想法。",
    "cta.title": "不要成为第 1,701 号。",
    "cta.subtitle": "大多数创始人不是因为想法不好而失败。他们失败是因为从未检查过自己的想法是否能活下来。成为例外。",
    "cta.button": "分析我的想法——免费",
    "analyze.title": "验证你的创业想法",
    "analyze.subtitle": "在下面描述你的想法。AI 将它与 1,749 个失败案例交叉比对，给你一个诚实的评估。",
    "analyze.placeholder": "详细描述你的创业想法。包括：解决什么问题、目标用户是谁、如何盈利、如何运作。描述越详细，分析越精准。",
    "analyze.industry": "行业（可选）",
    "analyze.stage": "当前阶段（可选）",
    "analyze.full": "完整报告",
    "analyze.quick": "快速扫描",
    "analyze.full.desc": "深度分析：11 种死亡模式、竞品评估、单位经济检查、行动计划。约 30 秒。",
    "analyze.quick.desc": "快速扫描：风险评分 + 前 3 大威胁。约 5 秒。",
    "analyze.button": "分析我的想法",
    "analyze.analyzing": "正在分析...",
    "analyze.examples": "试试示例",
    "analyze.whatYouGet": "你将获得",
    "analyze.streaming.title": "分析进行中",
    "analyze.streaming.subtitle": "正在将你的想法与 1,749 失败模式进行比对...",
    "analyze.streaming.viewReport": "查看完整报告",
    "analyze.streaming.newAnalysis": "重新分析",
    "report.back": "重新分析",
    "report.loading": "正在加载报告...",
    "report.notFound": "未找到报告",
    "report.expired": "报告可能已过期。请重新运行分析。",
    "report.analyzeNew": "分析新想法",
    "report.riskScore": "风险评分",
    "report.viability": "可行性",
    "report.difficulty": "难度",
    "report.timeToRevenue": "变现周期",
    "report.riskAnalysis": "风险分析",
    "report.competitor": "竞品分析",
    "report.unitEconomics": "单位经济评估",
    "report.actionPlan": "生存行动计划",
    "report.scanAgain": "再次扫描",
    "dashboard.title": "失败案例数据库",
    "dashboard.subtitle": "探索 1,749 失败案例。按行业、死因筛选或搜索特定公司。从历史中学习，避免重蹈覆辙。",
    "dashboard.explore": "浏览案例",
    "dashboard.stats": "死亡统计",
    "dashboard.industry": "行业模式",
    "dashboard.ready": "准备好用这些模式验证你自己的想法了吗？",
    "dashboard.analyze": "分析我的想法",
    "footer.inspired": "灵感来源于",
    "footer.tagline": "一个创始人的失败，是另一个创始人的宝藏。",
    "lang.switch": "English",
  },
}

export function LanguageProvider({ children, defaultLang = "zh" }: { children: ReactNode; defaultLang?: Lang }) {
  const [lang, setLangState] = useState<Lang>(defaultLang)
  const [hydrated, setHydrated] = useState(false)

  // Detect real language from localStorage after hydration (avoids SSR mismatch)
  useEffect(() => {
    try {
      const stored = localStorage.getItem("gg-lang")
      if (stored === "en" || stored === "zh") {
        setLangState(stored)
      } else {
        const nav = navigator.language || ""
        setLangState(nav.startsWith("zh") ? "zh" : "en")
      }
    } catch {
      // localStorage may be blocked
    }
    setHydrated(true)
  }, [])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    try {
      localStorage.setItem("gg-lang", l)
    } catch {
      // ignore
    }
  }, [])

  const t = useCallback(
    (key: string) => {
      return translations[lang]?.[key] || translations.en[key] || key
    },
    [lang]
  )

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  )
}

export function useLang() {
  const ctx = useContext(LanguageContext)
  if (!ctx) throw new Error("useLang must be used within LanguageProvider")
  return ctx
}
