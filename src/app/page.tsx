"use client"

import Link from "next/link"
import { buttonVariants } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useLang } from "@/lib/i18n/language-context"
import {
  Skull,
  ArrowRight,
  Shield,
  TrendingUp,
  Coins,
  BrainCircuit,
  BarChart3,
  Globe,
  CheckCircle2,
  XCircle,
  Zap,
} from "lucide-react"

export default function Home() {
  const { lang, t } = useLang()
  const isZh = lang === "zh"

  const deathCategories = [
    { name: isZh ? "产品问题" : "Product Problems", pct: "85.6%", color: "text-red-400" },
    { name: isZh ? "竞争淘汰" : "Competition", pct: "82.7%", color: "text-orange-400" },
    { name: isZh ? "单位经济崩塌" : "Unit Economics", pct: "62.6%", color: "text-yellow-400" },
  ]

  const features = [
    {
      icon: BrainCircuit,
      title: isZh ? "AI 深度分析" : "AI Deep Analysis",
      desc: isZh
        ? "基于 1,749 失败案例的 AI 分析引擎。将你的想法与真实失败模式进行匹配——发现你尚未意识到的致命缺陷。"
        : "Powered by AI. Match your idea against failure patterns from 1,749 dead startups — identify fatal flaws you haven't considered yet.",
    },
    {
      icon: Shield,
      title: isZh ? "11 种死亡模式" : "11 Death Patterns",
      desc: isZh
        ? "从产品问题到监管风险，从单位经济崩塌到创始人纠纷——全面的风险矩阵评估。"
        : "From product problems to regulatory risk, from unit economics collapse to founder disputes — comprehensive risk matrix assessment.",
    },
    {
      icon: BarChart3,
      title: isZh ? "量化评分" : "Quantified Scores",
      desc: isZh
        ? "风险评分、可行性评分、难度评级、变现时间线——数据驱动的决策，而非凭感觉猜。"
        : "Risk score, viability score, difficulty rating, monetization timeline — data-driven decisions instead of gut feelings.",
    },
    {
      icon: Coins,
      title: isZh ? "单位经济检查" : "Unit Economics Check",
      desc: isZh
        ? "62.6% 的失败源于每单都在亏钱。我们在你投入一分钱之前就帮你算清楚账。"
        : "62.6% of failures come from losing money on every sale. We run the numbers before you invest a single dollar.",
    },
    {
      icon: TrendingUp,
      title: isZh ? "分步行动计划" : "Step-by-Step Action Plan",
      desc: isZh
        ? "不仅告诉你什么会杀死你——还为每个风险因子提供具体、可立即执行的应对措施。"
        : "Not just what could kill you — specific, immediately actionable countermeasures for each risk factor.",
    },
    {
      icon: Globe,
      title: isZh ? "真实案例证据" : "Real Case Evidence",
      desc: isZh
        ? "每个风险因子都有真实失败案例支撑。不是 AI 幻觉——是历史的血泪教训。"
        : "Every risk factor backed by real failed startup stories. Not AI hallucinations — historical blood lessons.",
    },
  ]

  const roadmap = [
    {
      num: "01",
      title: t("how.step1.title"),
      desc: t("how.step1.desc"),
    },
    {
      num: "02",
      title: t("how.step2.title"),
      desc: t("how.step2.desc"),
    },
    {
      num: "03",
      title: t("how.step3.title"),
      desc: t("how.step3.desc"),
    },
    {
      num: "04",
      title: t("how.step4.title"),
      desc: t("how.step4.desc"),
    },
  ]

  const competitors = [
    { name: "Graveyard Gold", ai: true, data: true, action: true, price: "$29–$99" },
    { name: "ChatGPT", ai: true, data: false, action: false, price: "$20" },
    { name: "LivePlan", ai: false, data: false, action: false, price: "$20" },
    { name: "Stratup.ai", ai: true, data: false, action: false, price: isZh ? "免费" : "Free" },
    { name: "loot-drop.io", ai: false, data: true, action: false, price: isZh ? "免费" : "Free" },
  ]

  const compHeaders = isZh
    ? ["工具", "AI 分析", "失败数据库", "行动计划", "价格"]
    : ["Tool", "AI Analysis", "Failure DB", "Action Plan", "Price"]

  return (
    <main className="flex-1">
      {/* ──────── Hero ──────── */}
      <section className="relative overflow-hidden px-4 py-24 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(147,51,234,0.08),transparent_70%)]" />
        <div className="relative mx-auto max-w-3xl">
          <Badge variant="outline" className="mb-6 border-neutral-700 text-neutral-400 px-4 py-1.5 text-xs tracking-wide">
            {t("hero.badge")}
          </Badge>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl leading-tight">
            {t("hero.title1")}
            <br />
            <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              {t("hero.title2")}
            </span>
            <br />
            {t("hero.title3")}
          </h1>
          <p className="mt-6 text-lg text-neutral-400 max-w-xl mx-auto">
            {t("hero.subtitle")}
          </p>
          <div className="mt-8 flex items-center justify-center gap-4">
            <Link
              href="/analyze"
              className={buttonVariants({ size: "lg", className: "bg-purple-600 hover:bg-purple-500 text-base px-8" })}
            >
              {t("hero.scan")} <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link
              href="#how-it-works"
              className={buttonVariants({ variant: "outline", size: "lg", className: "text-base" })}
            >
              {t("hero.how")}
            </Link>
          </div>

          {/* Death stats */}
          <div className="mt-16 grid grid-cols-3 gap-8 max-w-lg mx-auto">
            {deathCategories.map((d) => (
              <div key={d.name} className="text-center">
                <div className={`text-2xl font-bold ${d.color}`}>{d.pct}</div>
                <div className="text-xs text-neutral-500 mt-1">{d.name}</div>
                <div className="text-xs text-neutral-600">{t("hero.lethality")}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* ──────── Stats Bar ──────── */}
      <section className="px-4 py-12 text-center">
        <p className="text-sm text-neutral-500 mb-4">{t("stats.label")}</p>
        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-2xl sm:text-3xl font-bold">
          <span className="text-purple-400">1,749</span>
          <span className="text-neutral-400">{t("stats.failed")}</span>
          <span className="text-neutral-600">·</span>
          <span className="text-purple-400">$535B+</span>
          <span className="text-neutral-400">{t("stats.burned")}</span>
          <span className="text-neutral-600">·</span>
          <span className="text-purple-400">11</span>
          <span className="text-neutral-400">{t("stats.patterns")}</span>
        </div>
      </section>

      <Separator className="max-w-6xl mx-auto" />

      {/* ──────── How it works ──────── */}
      <section id="how-it-works" className="px-4 py-24 max-w-5xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">{t("how.title")}</h2>
        <p className="text-neutral-400 text-center mb-12 max-w-lg mx-auto">
          {t("how.subtitle")}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {roadmap.map((step) => (
            <Card key={step.num} className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <span className="text-sm font-bold text-purple-400">{step.num}</span>
                <CardTitle className="text-lg">{step.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-neutral-400">{step.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ──────── Features ──────── */}
      <section className="px-4 py-24 max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">{t("why.title")}</h2>
        <p className="text-neutral-400 text-center mb-12">
          {t("why.subtitle")}
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f) => (
            <Card key={f.title} className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
              <CardContent className="pt-6">
                <f.icon className="h-8 w-8 text-purple-400 mb-4" />
                <h3 className="font-semibold mb-2 text-white">{f.title}</h3>
                <p className="text-sm text-neutral-400">{f.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* ──────── Competition Table ──────── */}
      <section className="px-4 py-24 max-w-4xl mx-auto">
        <h2 className="text-3xl font-bold text-center mb-4">{t("comp.title")}</h2>
        <p className="text-neutral-400 text-center mb-12">{t("comp.subtitle")}</p>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-neutral-800 text-left text-neutral-500 text-xs uppercase tracking-wider">
                {compHeaders.map((h) => (
                  <th key={h} className="py-3 px-4">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {competitors.map((c, i) => (
                <tr key={c.name} className="border-b border-neutral-800/50">
                  <td className={`py-3 px-4 ${i === 0 ? "font-bold text-white" : "text-neutral-300"}`}>
                    {c.name}
                    {i === 0 && <Badge className="ml-2 bg-purple-600/20 text-purple-400 text-[10px]">WE</Badge>}
                  </td>
                  <td className="py-3 px-4">{c.ai ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-neutral-700" />}</td>
                  <td className="py-3 px-4">{c.data ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-neutral-700" />}</td>
                  <td className="py-3 px-4">{c.action ? <CheckCircle2 className="h-4 w-4 text-green-400" /> : <XCircle className="h-4 w-4 text-neutral-700" />}</td>
                  <td className="py-3 px-4 text-neutral-400">{c.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ──────── CTA ──────── */}
      <section className="px-4 py-24 text-center">
        <div className="max-w-2xl mx-auto p-12 rounded-2xl bg-gradient-to-br from-purple-950/50 to-neutral-900 border border-neutral-800">
          <Skull className="h-12 w-12 text-purple-400 mx-auto mb-4" />
          <h2 className="text-3xl font-bold mb-4">
            {t("cta.title")}
          </h2>
          <p className="text-neutral-400 mb-8 max-w-md mx-auto">
            {t("cta.subtitle")}
          </p>
          <Link
            href="/analyze"
            className={buttonVariants({ size: "lg", className: "bg-purple-600 hover:bg-purple-500 text-base px-10 py-6 text-lg" })}
          >
            <Zap className="mr-2 h-5 w-5" />
            {t("cta.button")}
          </Link>
        </div>
      </section>
    </main>
  )
}
