"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { AnalysisReport, RiskFactor } from "@/lib/types";
import { getDeathCategoryLabel } from "@/lib/types";
import { useLang } from "@/lib/i18n/language-context";
import { analytics } from "@/lib/analytics";
import {
  AlertTriangle,
  CheckCircle2,
  Shield,
  TrendingUp,
  DollarSign,
  Target,
  Clock,
  ArrowLeft,
  ExternalLink,
  Zap,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

const severityConfig = {
  high: { color: "text-red-400", bg: "bg-red-400/10", border: "border-red-400/30", label: "High Risk" },
  medium: { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/30", label: "Medium Risk" },
  low: { color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/30", label: "Low Risk" },
};

function RiskScoreGauge({ score }: { score: number }) {
  const { lang } = useLang()
  const isZh = lang === "zh"
  const color = score >= 70 ? "text-red-400" : score >= 40 ? "text-yellow-400" : "text-green-400";
  const bg = score >= 70 ? "bg-red-400" : score >= 40 ? "bg-yellow-400" : "bg-green-400";
  const label = score >= 70 ? (isZh ? "高风险" : "HIGH RISK") : score >= 40 ? (isZh ? "中等风险" : "MODERATE RISK") : (isZh ? "低风险" : "LOW RISK");

  return (
    <div className="flex flex-col items-center p-6">
      <div className="relative w-32 h-32 mb-4">
        <svg className="w-32 h-32 -rotate-90" viewBox="0 0 128 128">
          <circle cx="64" cy="64" r="56" fill="none" stroke="rgb(38,38,40)" strokeWidth="12" />
          <circle
            cx="64"
            cy="64"
            r="56"
            fill="none"
            stroke="currentColor"
            strokeWidth="12"
            strokeDasharray={`${(score / 100) * 352} 352`}
            className={color}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={`text-3xl font-bold ${color}`}>{score}</span>
        </div>
      </div>
      <Badge className={severityConfig[score >= 70 ? "high" : score >= 40 ? "medium" : "low"].bg + " " + severityConfig[score >= 70 ? "high" : score >= 40 ? "medium" : "low"].color}>
        {label}
      </Badge>
    </div>
  );
}

function RiskFactorCard({ risk }: { risk: RiskFactor }) {
  const { lang } = useLang()
  const isZh = lang === "zh"
  const [expanded, setExpanded] = useState(risk.severity === "high");
  const sev = severityConfig[risk.severity] || severityConfig.medium;

  const sevLabel = isZh
    ? { high: "高风险", medium: "中风险", low: "低风险" }[risk.severity]
    : risk.severity.toUpperCase()

  return (
    <Card className={`bg-neutral-900 border ${sev.border} cursor-pointer hover:border-neutral-700 transition-colors`} onClick={() => setExpanded(!expanded)}>
      <CardContent className="pt-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3">
            <AlertTriangle className={`h-5 w-5 mt-0.5 shrink-0 ${sev.color}`} />
            <div>
              <h3 className="font-semibold text-white">
                {getDeathCategoryLabel(risk.category, lang)}
              </h3>
              <p className="text-sm text-neutral-400 mt-1">{risk.explanation}</p>
              <div className="flex items-center gap-3 mt-2">
                <Badge variant="outline" className={`text-xs ${sev.color} border-current`}>
                  {sevLabel}
                </Badge>
                <span className="text-xs text-neutral-500">{isZh ? "概率" : "Probability"}: {risk.probability}%</span>
              </div>
            </div>
          </div>
          <ChevronDown className={`h-4 w-4 shrink-0 text-neutral-500 transition-transform ${expanded ? "rotate-180" : ""}`} />
        </div>

        {expanded && (
          <div className="mt-4 pl-8 space-y-3">
            {risk.similar_cases.length > 0 && (
              <div>
                <p className="text-xs text-neutral-500 mb-1">{isZh ? "相似失败案例" : "Similar Failures"}:</p>
                <div className="flex flex-wrap gap-1">
                  {risk.similar_cases.map((c) => (
                    <Badge key={c} variant="secondary" className="text-[10px] bg-neutral-800">
                      {c}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {risk.mitigation.length > 0 && (
              <div>
                <p className="text-xs text-neutral-500 mb-1">{isZh ? "应对策略" : "How to Avoid"}:</p>
                <ul className="space-y-1">
                  {risk.mitigation.map((m, i) => (
                    <li key={i} className="text-xs text-green-400 flex items-start gap-2">
                      <CheckCircle2 className="h-3 w-3 mt-0.5 shrink-0" />
                      {m}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function isValidReport(data: unknown): data is AnalysisReport {
  if (!data || typeof data !== "object") return false
  const r = data as Record<string, unknown>
  return (
    typeof r.overall_risk_score === "number" &&
    typeof r.viability_score === "number" &&
    Array.isArray(r.risk_factors) &&
    typeof r.idea_summary === "string" &&
    typeof r.industry === "string" &&
    Array.isArray(r.action_plan)
  )
}

export default function ReportPage() {
  const params = useParams();
  const { lang, t } = useLang()
  const isZh = lang === "zh"
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const id = params.id as string

    async function loadReport() {
      // If we have a real UUID, try the server first
      if (id && id !== "current") {
        try {
          const res = await fetch(`/api/reports/${id}`)
          if (res.ok) {
            const data = await res.json()
            if (isValidReport(data)) {
              setReport(data)
              analytics.reportViewed(id)
              setLoading(false)
              return
            }
          }
        } catch {
          // Server fetch failed, fall through to localStorage
        }
      }

      // Fallback: read from sessionStorage/localStorage
      const stored = sessionStorage.getItem("current_report") || localStorage.getItem("current_report")
      if (stored) {
        try {
          const parsed = JSON.parse(stored)
          if (isValidReport(parsed)) {
            setReport(parsed)
            analytics.reportViewed(id)
          }
        } catch {
          // Invalid JSON
        }
      }
      setLoading(false)
    }

    loadReport()
  }, [params.id])

  if (loading) {
    return (
      <main className="flex-1 px-4 py-24 text-center">
        <p className="text-neutral-400">{t("report.loading")}</p>
      </main>
    );
  }

  if (!report) {
    return (
      <main className="flex-1 px-4 py-24 text-center max-w-lg mx-auto">
          <AlertTriangle className="h-12 w-12 text-yellow-400 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-4">{t("report.notFound")}</h1>
          <p className="text-neutral-400 mb-8">
            {t("report.expired")}
          </p>
          <Link href="/analyze" className={buttonVariants({ className: "bg-purple-600 hover:bg-purple-500" })}>
            <ArrowLeft className="h-4 w-4 mr-2" /> {t("report.analyzeNew")}
          </Link>
        </main>
    );
  }

  const highRisks = report.risk_factors.filter((r: RiskFactor) => r.severity === "high");
  const medRisks = report.risk_factors.filter((r: RiskFactor) => r.severity === "medium");
  const lowRisks = report.risk_factors.filter((r: RiskFactor) => r.severity === "low");

  return (
    <main className="flex-1 px-4 py-12 max-w-4xl mx-auto w-full">
        {/* Back button */}
        <Link
          href="/analyze"
          className="inline-flex items-center gap-2 text-sm text-neutral-400 hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft className="h-4 w-4" /> {t("report.back")}
        </Link>

        {/* Report Header */}
        <div className="mb-8">
          <Badge variant="outline" className="mb-3 border-purple-800 text-purple-400">
            {isZh ? "分析完成" : "ANALYSIS COMPLETE"}
          </Badge>
          <h1 className="text-2xl font-bold mb-2">{report.idea_summary}</h1>
          <div className="flex flex-wrap gap-2 text-sm text-neutral-400">
            <span>{isZh ? "行业" : "Industry"}: <strong className="text-white">{report.industry}</strong></span>
            <span className="text-neutral-700">|</span>
            <span>{isZh ? "模式" : "Model"}: <strong className="text-white">{report.business_model}</strong></span>
            <span className="text-neutral-700">|</span>
            <span>{isZh ? "市场" : "Market"}: <strong className="text-white">{report.target_market}</strong></span>
          </div>
        </div>

        {/* Score Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="pt-6 text-center">
              <RiskScoreGauge score={report.overall_risk_score} />
              <p className="text-xs text-neutral-500 mt-2">{t("report.riskScore")}</p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="pt-6 text-center">
              <div className="flex flex-col items-center p-2">
                <div className={`text-3xl font-bold ${report.viability_score >= 60 ? "text-green-400" : report.viability_score >= 30 ? "text-yellow-400" : "text-red-400"}`}>
                  {report.viability_score}%
                </div>
              </div>
              <p className="text-xs text-neutral-500 mt-2">{t("report.viability")}</p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="pt-6 text-center">
              <div className="flex justify-center py-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className={`text-2xl ${i < report.difficulty_rating ? "text-yellow-400" : "text-neutral-700"}`}>
                    ★
                  </span>
                ))}
              </div>
              <p className="text-xs text-neutral-500 mt-2">{t("report.difficulty")}</p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="pt-6 text-center">
              <div className="text-3xl font-bold text-blue-400 py-2">{report.monetization_timeline_months}m</div>
              <p className="text-xs text-neutral-500 mt-2">{t("report.timeToRevenue")}</p>
            </CardContent>
          </Card>
        </div>

        <Separator className="my-8" />

        {/* Risk Analysis */}
        <Tabs defaultValue="all" className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{t("report.riskAnalysis")}</h2>
            <TabsList className="bg-neutral-800">
              <TabsTrigger value="all" className="text-xs">{isZh ? "全部" : "All"} ({report.risk_factors.length})</TabsTrigger>
              <TabsTrigger value="high" className="text-xs">
                <span className="text-red-400">{isZh ? "高" : "High"} ({highRisks.length})</span>
              </TabsTrigger>
              <TabsTrigger value="medium" className="text-xs">
                <span className="text-yellow-400">{isZh ? "中" : "Med"} ({medRisks.length})</span>
              </TabsTrigger>
              <TabsTrigger value="low" className="text-xs">
                <span className="text-green-400">{isZh ? "低" : "Low"} ({lowRisks.length})</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="all" className="space-y-3">
            {report.risk_factors.map((risk: RiskFactor, i: number) => (
              <RiskFactorCard key={i} risk={risk} />
            ))}
          </TabsContent>
          <TabsContent value="high" className="space-y-3">
            {highRisks.map((risk: RiskFactor, i: number) => (
              <RiskFactorCard key={i} risk={risk} />
            ))}
            {highRisks.length === 0 && <p className="text-neutral-500 text-sm">{isZh ? "未检测到高风险因子。" : "No high-severity risks detected."}</p>}
          </TabsContent>
          <TabsContent value="medium" className="space-y-3">
            {medRisks.map((risk: RiskFactor, i: number) => (
              <RiskFactorCard key={i} risk={risk} />
            ))}
          </TabsContent>
          <TabsContent value="low" className="space-y-3">
            {lowRisks.map((risk: RiskFactor, i: number) => (
              <RiskFactorCard key={i} risk={risk} />
            ))}
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        {/* Detailed Analysis */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Target className="h-4 w-4 text-blue-400" />
                {t("report.competitor")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-300 leading-relaxed">{report.competitor_analysis}</p>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <DollarSign className="h-4 w-4 text-green-400" />
                {t("report.unitEconomics")}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-neutral-300 leading-relaxed">{report.unit_economics_assessment}</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Plan */}
        <Card className="bg-neutral-900 border-neutral-800 mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Shield className="h-4 w-4 text-purple-400" />
              {t("report.actionPlan")}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className="space-y-3">
              {report.action_plan.map((step: string, i: number) => (
                <li key={i} className="flex items-start gap-3 text-sm text-neutral-300">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-purple-600/20 text-purple-400 text-xs font-bold shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {step}
                </li>
              ))}
            </ol>
          </CardContent>
        </Card>

        {/* CTA */}
        <div className="text-center py-8">
          <p className="text-neutral-500 text-sm mb-4">{isZh ? "想迭代改进？优化你的想法，重新扫描。" : "Want to iterate? Refine your idea and run another scan."}</p>
          <Link href="/analyze" className={buttonVariants({ size: "lg", className: "bg-purple-600 hover:bg-purple-500" })}>
            <RefreshCw className="h-4 w-4 mr-2" /> {t("report.scanAgain")}
          </Link>
        </div>
    </main>
  );
}
