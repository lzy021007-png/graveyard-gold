"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { useLang } from "@/lib/i18n/language-context"
import { getDeathCategoryLabel, type DeathCategory } from "@/lib/types"
import { analytics } from "@/lib/analytics"
import {
  BrainCircuit, ArrowRight, Lightbulb, AlertTriangle, Shield,
  Clock, TrendingUp, DollarSign, Target, RefreshCw, FileText, Zap,
  CheckCircle2, XCircle, ChevronDown, Skull, BarChart3,
} from "lucide-react"

const exampleIdeasEn = [
  "An AI-powered personal tutor for software engineers that creates customized learning paths based on their current job and career goals. Monthly subscription at $39/month.",
  "A peer-to-peer platform for renting outdoor gear (camping, skiing, surfing) from locals. Take 15% commission on each rental.",
  "A SaaS tool that automatically generates and schedules social media content for local restaurants using AI. $49/month per restaurant.",
  "An on-demand EV battery swapping service for electric scooter fleets in dense Asian cities. B2B model charging per swap.",
]
const exampleIdeasZh = [
  "一个AI驱动的个人导师平台，根据软件工程师的当前工作和职业目标，创建个性化学习路径。月订阅费39元。",
  "一个P2P户外装备租赁平台（露营、滑雪、冲浪），从本地人那里租用装备。每笔租赁收取15%佣金。",
  "一个SaaS工具，用AI自动为本地餐厅生成和排期社交媒体内容。每家餐厅每月49元。",
  "面向亚洲密集城市电动滑板车车队的按需换电服务。B2B模式，按次收费。",
]

type StreamState = {
  text: string
  status: "idle" | "streaming" | "done" | "error"
  error?: string
  report?: Record<string, unknown>
  reportId?: string
}

const severityConfig: Record<string, { color: string; bg: string; border: string }> = {
  high: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30" },
  medium: { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30" },
  low: { color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30" },
}

function RiskScoreGauge({ score }: { score: number }) {
  const color = score >= 70 ? "text-red-400" : score >= 40 ? "text-yellow-400" : "text-green-400"
  return (
    <div className="flex flex-col items-center p-4">
      <div className="relative w-24 h-24 mb-3">
        <svg className="w-24 h-24 -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="56" fill="none" stroke="rgb(38,38,40)" strokeWidth="12" />
          <circle cx="64" cy="64" r="56" fill="none" stroke="currentColor" strokeWidth="12"
            strokeDasharray={`${(score / 100) * 352} 352`}
            className={color} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-2xl font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <Badge className={severityConfig[score >= 70 ? "high" : score >= 40 ? "medium" : "low"].bg + " " + severityConfig[score >= 70 ? "high" : score >= 40 ? "medium" : "low"].color}>
        {score >= 70 ? "HIGH" : score >= 40 ? "MODERATE" : "LOW"}
      </Badge>
    </div>
  )
}

function LiveReportPreview({ stream }: { stream: StreamState }) {
  const { lang, t } = useLang()
  const isZh = lang === "zh"

  if (!stream.text && stream.status !== "streaming") return null

  // Extract any visible JSON fields to show live preview
  const extractField = (text: string, field: string): string | null => {
    const match = text.match(new RegExp(`"${field}"\\s*:\\s*"([^"]*)"`))
    return match ? match[1] : null
  }
  const extractNum = (text: string, field: string): number | null => {
    const match = text.match(new RegExp(`"${field}"\\s*:\\s*(\\d+\\.?\\d*)`))
    return match ? parseFloat(match[1]) : null
  }
  const extractArrayCount = (text: string, field: string): number => {
    // Count items in array by counting object openings after the field
    const idx = text.indexOf(`"${field}"`)
    if (idx === -1) return 0
    const slice = text.slice(idx)
    return (slice.match(/\{"category"/g) || []).length
  }

  const riskScore = extractNum(stream.text, "overall_risk_score")
  const viability = extractNum(stream.text, "viability_score")
  const ideaSummary = extractField(stream.text, "idea_summary")
  const difficulty = extractNum(stream.text, "difficulty_rating")
  const timeline = extractNum(stream.text, "monetization_timeline_months")
  const industry = extractField(stream.text, "industry")

  // Count risk factors so far
  const riskCount = extractArrayCount(stream.text, "risk_factors")
  const actionCount = (stream.text.match(/"Step \\d/i) || []).length
  const mitigationCount = (stream.text.match(/"mitigation"/g) || []).length

  const charCount = stream.text.length
  const hasContent = charCount > 20

  return (
    <div className="mt-8 space-y-4 animate-in fade-in duration-300">
      <Separator className="max-w-2xl mx-auto" />

      {/* Status header */}
      <div className="max-w-2xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 text-purple-400 animate-spin" />
          <span className="text-sm text-purple-400 font-medium">
            {isZh ? "AI 实时分析中..." : "AI analyzing in real-time..."}
          </span>
        </div>
        <span className="text-xs text-neutral-600">
          {charCount} {isZh ? "字符已生成" : "chars generated"}
        </span>
      </div>

      {/* Live stats grid */}
      <div className="max-w-2xl mx-auto grid grid-cols-2 sm:grid-cols-4 gap-3">
        {riskScore !== null ? (
          <Card className="bg-neutral-900 border-neutral-800 text-center">
            <CardContent className="pt-3 pb-3">
              <div className={`text-xl font-bold ${riskScore >= 70 ? "text-red-400" : riskScore >= 40 ? "text-yellow-400" : "text-green-400"}`}>
                {riskScore}
              </div>
              <div className="text-[10px] text-neutral-500">{t("report.riskScore")}</div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-neutral-900 border-neutral-800 text-center opacity-40">
            <CardContent className="pt-3 pb-3">
              <div className="text-xl font-bold text-neutral-600">--</div>
              <div className="text-[10px] text-neutral-600">{t("report.riskScore")}</div>
            </CardContent>
          </Card>
        )}
        {viability !== null ? (
          <Card className="bg-neutral-900 border-neutral-800 text-center">
            <CardContent className="pt-3 pb-3">
              <div className="text-xl font-bold text-blue-400">{viability}%</div>
              <div className="text-[10px] text-neutral-500">{t("report.viability")}</div>
            </CardContent>
          </Card>
        ) : (
          <Card className="bg-neutral-900 border-neutral-800 text-center opacity-40">
            <CardContent className="pt-3 pb-3">
              <div className="text-xl font-bold text-neutral-600">--</div>
              <div className="text-[10px] text-neutral-600">{t("report.viability")}</div>
            </CardContent>
          </Card>
        )}
        <Card className="bg-neutral-900 border-neutral-800 text-center">
          <CardContent className="pt-3 pb-3">
            <div className="text-xl font-bold text-purple-400">{riskCount || "--"}</div>
            <div className="text-[10px] text-neutral-500">{isZh ? "风险因子" : "Risks"}</div>
          </CardContent>
        </Card>
        <Card className="bg-neutral-900 border-neutral-800 text-center">
          <CardContent className="pt-3 pb-3">
            <div className="text-xl font-bold text-green-400">{mitigationCount || "--"}</div>
            <div className="text-[10px] text-neutral-500">{isZh ? "对策" : "Mitigations"}</div>
          </CardContent>
        </Card>
      </div>

      {/* Idea summary preview */}
      {ideaSummary && (
        <Card className="bg-neutral-900 border-neutral-800 max-w-2xl mx-auto">
          <CardContent className="pt-3 pb-3">
            <p className="text-xs text-neutral-500 mb-1">{isZh ? "摘要" : "Summary"}</p>
            <p className="text-sm text-neutral-300">{ideaSummary}</p>
          </CardContent>
        </Card>
      )}

      {/* Industry preview */}
      {industry && (
        <div className="max-w-2xl mx-auto flex flex-wrap gap-2">
          <Badge variant="outline" className="text-[10px] border-neutral-700 text-neutral-400">
            {isZh ? "行业：" : "Industry: "}{industry}
          </Badge>
          {difficulty !== null && (
            <Badge variant="outline" className="text-[10px] border-neutral-700 text-neutral-400">
              {isZh ? "难度：" : "Difficulty: "}{"★".repeat(difficulty)}
            </Badge>
          )}
          {timeline !== null && (
            <Badge variant="outline" className="text-[10px] border-neutral-700 text-neutral-400">
              {isZh ? "变现：" : "Revenue: "}{timeline}{isZh ? "个月" : "mo"}
            </Badge>
          )}
        </div>
      )}

      {/* Live text stream (compact, scrollable) */}
      {hasContent && (
        <details className="max-w-2xl mx-auto">
          <summary className="text-xs text-neutral-600 cursor-pointer hover:text-neutral-400 transition-colors">
            {isZh ? "查看原始输出" : "View raw output"}
          </summary>
          <Card className="bg-neutral-950 border-neutral-800 mt-2 max-h-48 overflow-y-auto">
            <CardContent className="pt-3 pb-3">
              <pre className="text-xs text-neutral-500 font-mono whitespace-pre-wrap break-all">
                {stream.text}
              </pre>
            </CardContent>
          </Card>
        </details>
      )}
    </div>
  )
}

export default function AnalyzePage() {
  const { lang, t } = useLang()
  const isZh = lang === "zh"
  const examples = isZh ? exampleIdeasZh : exampleIdeasEn

  const [idea, setIdea] = useState("")
  const [industry, setIndustry] = useState("")
  const [stage, setStage] = useState("")
  const [mode, setMode] = useState<"full" | "quick">("full")
  const [stream, setStream] = useState<StreamState>({ text: "", status: "idle" })
  const abortRef = useRef<AbortController | null>(null)

  const pageEnterRef = useRef(Date.now())

  // Cleanup: abort any in-flight request on unmount + track quick exit
  useEffect(() => {
    pageEnterRef.current = Date.now()
    return () => {
      abortRef.current?.abort()
      const duration = Date.now() - pageEnterRef.current
      if (duration < 10000) {
        analytics.quickExit(duration)
      }
    }
  }, [])

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (idea.trim().length < 10) return

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    setStream({ text: "", status: "streaming" })
    const startTime = Date.now()
    analytics.analyzeStarted(mode, !!industry, !!stage)

    try {
      const res = await fetch("/api/analyze/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          idea: idea.trim(),
          industry: industry || undefined,
          stage: stage || undefined,
          mode,
          lang,
        }),
        signal: controller.signal,
      })

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Request failed" }))
        setStream({ text: "", status: "error", error: err.error })
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        setStream({ text: "", status: "error", error: "No response stream" })
        return
      }

      const decoder = new TextDecoder()
      let fullText = ""
      let buffer = ""

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split("\n")
        buffer = lines.pop() || ""

        for (const line of lines) {
          const trimmed = line.trim()
          if (!trimmed || !trimmed.startsWith("data: ")) continue

          try {
            const event = JSON.parse(trimmed.slice(6))
            if (event.type === "text") {
              fullText += event.text
              setStream({ text: fullText, status: "streaming" })
            } else if (event.type === "done") {
              // Try to parse the full report
              const jsonMatch = fullText.match(/\{[\s\S]*\}/)
              let report: Record<string, unknown> | null = null
              if (jsonMatch) {
                try {
                  report = JSON.parse(jsonMatch[0])
                } catch {
                  // Malformed JSON from AI — show what we have as text
                  setStream({ text: fullText, status: "error", error: isZh ? "AI 返回了格式错误的数据，请重试" : "AI returned malformed data. Please try again." })
                  analytics.analyzeFailed(mode, 'malformed_json')
                  return
                }
              }
              let reportId: string | undefined
              if (report) {
                sessionStorage.setItem("current_report", JSON.stringify(report))
                localStorage.setItem("current_report", JSON.stringify(report))
                // Save server-side for sharing/bookmarking
                try {
                  const saveRes = await fetch("/api/reports", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(report),
                  })
                  if (saveRes.ok) {
                    const saved = await saveRes.json()
                    reportId = saved.id
                  }
                } catch {
                  // Server save is best-effort; local storage is the fallback
                }
              }
              setStream({ text: fullText, status: "done", report: report || undefined, reportId })
              analytics.analyzeCompleted(mode, (report as Record<string, number>)?.overall_risk_score || 0, Date.now() - startTime)
            } else if (event.type === "error") {
              setStream({ text: fullText, status: "error", error: event.message })
            }
          } catch {
            // skip parse errors on partial chunks
          }
        }
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return
      analytics.analyzeFailed(mode, (err as Error).message)
      setStream({ text: "", status: "error", error: (err as Error).message })
    }
  }, [idea, industry, stage, mode, lang])

  const handleExample = (ex: string, index: number) => {
    abortRef.current?.abort()
    analytics.exampleClicked(index)
    setIdea(ex)
    setStream({ text: "", status: "idle" })
  }

  const reset = () => {
    abortRef.current?.abort()
    setStream({ text: "", status: "idle" })
  }

  const isStreaming = stream.status === "streaming"
  const isDone = stream.status === "done" && stream.report

  return (
    <div className="flex-1 px-4 py-12 max-w-4xl mx-auto w-full">
      <div className="text-center mb-12">
        <Badge variant="outline" className="mb-4 border-purple-800 text-purple-400">
          <BrainCircuit className="h-3 w-3 mr-1" /> {isZh ? "AI 驱动分析" : "AI-Powered Analysis"}
        </Badge>
        <h1 className="text-3xl font-bold mb-3">{t("analyze.title")}</h1>
        <p className="text-neutral-400 max-w-lg mx-auto">{t("analyze.subtitle")}</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit}>
            <Card className="bg-neutral-900 border-neutral-800">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Lightbulb className="h-5 w-5 text-yellow-400" />
                  {isZh ? "你的想法" : "Your Idea"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <label htmlFor="idea-input" className="sr-only">{isZh ? "你的创业想法" : "Your Startup Idea"}</label>
                <Textarea
                  id="idea-input"
                  placeholder={t("analyze.placeholder")}
                  value={idea}
                  onChange={(e) => setIdea(e.target.value)}
                  rows={8}
                  className="bg-neutral-950 border-neutral-700 resize-none"
                  disabled={isStreaming}
                />

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">{t("analyze.industry")}</label>
                    <Input
                      placeholder={isZh ? "如：SaaS、医疗、电商" : "e.g. SaaS, Healthcare, E-commerce"}
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      className="bg-neutral-950 border-neutral-700"
                      disabled={isStreaming}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-neutral-500 mb-1 block">{t("analyze.stage")}</label>
                    <Input
                      placeholder={isZh ? "如：想法阶段、MVP、已上线" : "e.g. Idea, MVP, Launched"}
                      value={stage}
                      onChange={(e) => setStage(e.target.value)}
                      className="bg-neutral-950 border-neutral-700"
                      disabled={isStreaming}
                    />
                  </div>
                </div>

                <Tabs defaultValue="full" onValueChange={(v) => setMode(v as "full" | "quick")}>
                  <TabsList className="bg-neutral-800">
                    <TabsTrigger value="full" className="text-xs">
                      <FileText className="h-3 w-3 mr-1" /> {t("analyze.full")}
                    </TabsTrigger>
                    <TabsTrigger value="quick" className="text-xs">
                      <Zap className="h-3 w-3 mr-1" /> {t("analyze.quick")}
                    </TabsTrigger>
                  </TabsList>
                  <TabsContent value="full">
                    <p className="text-xs text-neutral-500">{t("analyze.full.desc")}</p>
                  </TabsContent>
                  <TabsContent value="quick">
                    <p className="text-xs text-neutral-500">{t("analyze.quick.desc")}</p>
                  </TabsContent>
                </Tabs>

                {!isDone && (
                  <Button
                    type="submit"
                    disabled={isStreaming || idea.trim().length < 10}
                    className="w-full bg-purple-600 hover:bg-purple-500 text-base py-6"
                    size="lg"
                  >
                    {isStreaming ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        {t("analyze.analyzing")}
                      </>
                    ) : (
                      <>
                        <ArrowRight className="h-4 w-4 mr-2" />
                        {t("analyze.button")}
                      </>
                    )}
                  </Button>
                )}

                {isDone && (
                  <div className="flex gap-3">
                    <Button onClick={reset} variant="outline" size="lg" className="flex-1">
                      {t("analyze.streaming.newAnalysis")}
                    </Button>
                    <Button onClick={() => window.open(stream.reportId ? `/report/${stream.reportId}` : "/report/current", "_blank")} size="lg" className="flex-1 bg-purple-600 hover:bg-purple-500">
                      {t("analyze.streaming.viewReport")}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </form>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-sm mb-3">{t("analyze.whatYouGet")}</h3>
              <ul className="space-y-2 text-xs text-neutral-400">
                <li className="flex items-start gap-2">
                  <AlertTriangle className="h-3.5 w-3.5 text-red-400 mt-0.5 shrink-0" />
                  {isZh ? "风险评分 + 11 类威胁评估" : "Risk score and 11-category threat assessment"}
                </li>
                <li className="flex items-start gap-2">
                  <Shield className="h-3.5 w-3.5 text-green-400 mt-0.5 shrink-0" />
                  {isZh ? "每个风险的具体应对策略" : "Specific mitigation strategies for each risk"}
                </li>
                <li className="flex items-start gap-2">
                  <TrendingUp className="h-3.5 w-3.5 text-blue-400 mt-0.5 shrink-0" />
                  {isZh ? "相似失败案例研究" : "Similar failed startup case studies"}
                </li>
                <li className="flex items-start gap-2">
                  <DollarSign className="h-3.5 w-3.5 text-yellow-400 mt-0.5 shrink-0" />
                  {isZh ? "单位经济可持续性评估" : "Unit economics sustainability assessment"}
                </li>
                <li className="flex items-start gap-2">
                  <Target className="h-3.5 w-3.5 text-purple-400 mt-0.5 shrink-0" />
                  {isZh ? "分步生存行动计划" : "Step-by-step survival action plan"}
                </li>
                <li className="flex items-start gap-2">
                  <Clock className="h-3.5 w-3.5 text-neutral-400 mt-0.5 shrink-0" />
                  {isZh ? "难度评级 + 变现时间线" : "Difficulty rating + monetization timeline"}
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="pt-6">
              <h3 className="font-semibold text-sm mb-3">{t("analyze.examples")}</h3>
              <div className="space-y-2">
                {examples.map((ex, i) => (
                  <button
                    key={i}
                    onClick={() => handleExample(ex, i)}
                    disabled={isStreaming}
                    className="block w-full text-left text-xs text-neutral-400 hover:text-white p-2 rounded hover:bg-neutral-800 transition-colors"
                  >
                    &ldquo;{ex.slice(0, 90)}...&rdquo;
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Live streaming preview */}
      {isStreaming && <LiveReportPreview stream={stream} />}

      {/* Error state */}
      {stream.status === "error" && (
        <div className="mt-8 text-center">
          <Separator className="max-w-2xl mx-auto mb-8" />
          <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <p className="text-red-400 mb-2">{isZh ? "分析失败" : "Analysis Failed"}</p>
          <p className="text-sm text-neutral-500 mb-4">{stream.error}</p>
          <Button onClick={reset} variant="outline">
            {isZh ? "重试" : "Retry"}
          </Button>
        </div>
      )}

      {/* Done state with full report preview */}
      {isDone && stream.report && (
        <div className="mt-8 space-y-6 max-w-2xl mx-auto">
          <Separator />
          <h2 className="text-xl font-bold text-center">
            {isZh ? "报告概览" : "Report Overview"}
          </h2>

          {/* Score cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-4 pb-4 text-center">
                <RiskScoreGauge score={(stream.report as Record<string, number>).overall_risk_score || 0} />
                <p className="text-xs text-neutral-500 mt-1">{t("report.riskScore")}</p>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-6 pb-4 text-center">
                <div className="text-2xl font-bold text-green-400">
                  {(stream.report as Record<string, number>).viability_score || 0}%
                </div>
                <p className="text-xs text-neutral-500 mt-1">{t("report.viability")}</p>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-6 pb-4 text-center">
                <div className="text-2xl font-bold text-yellow-400">
                  {"★".repeat((stream.report as Record<string, number>).difficulty_rating || 1)}
                </div>
                <p className="text-xs text-neutral-500 mt-1">{t("report.difficulty")}</p>
              </CardContent>
            </Card>
            <Card className="bg-neutral-900 border-neutral-800">
              <CardContent className="pt-6 pb-4 text-center">
                <div className="text-2xl font-bold text-blue-400">
                  {(stream.report as Record<string, number>).monetization_timeline_months || 0}m
                </div>
                <p className="text-xs text-neutral-500 mt-1">{t("report.timeToRevenue")}</p>
              </CardContent>
            </Card>
          </div>

          {/* Risk factors summary */}
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="text-base">
                {isZh ? "风险因子" : "Risk Factors"}
                {" "}({((stream.report as Record<string, unknown>).risk_factors as Array<Record<string, unknown>>)?.length || 0})
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {((stream.report as Record<string, unknown>).risk_factors as Array<Record<string, unknown>>)?.map((risk, i) => {
                const sev = severityConfig[risk.severity as string] || severityConfig.medium
                return (
                  <div key={i} className={`p-3 rounded-lg border ${sev.border} bg-neutral-950`}>
                    <div className="flex items-center gap-2">
                      <AlertTriangle className={`h-4 w-4 ${sev.color}`} />
                      <span className="text-sm font-medium text-white">
                        {getDeathCategoryLabel(risk.category as DeathCategory, lang)}
                      </span>
                      <Badge className={`text-[10px] ${sev.color} border-current`} variant="outline">
                        {risk.severity as string}
                      </Badge>
                      <span className="text-xs text-neutral-500 ml-auto">{risk.probability as number}%</span>
                    </div>
                  </div>
                )
              })}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
