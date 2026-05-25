"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  failedStartupsZh as seedDataZh,
  failedStartupsEn as seedDataEn,
  deathCategoryStatsZh,
  deathCategoryStatsEn,
  industryPatternsZh,
  industryPatternsEn,
} from "@/lib/db/seed-data";
import { getDeathCategoryLabel } from "@/lib/types";
import type { DeathCategory, FailedStartup } from "@/lib/types";
import { useLang } from "@/lib/i18n/language-context";
import {
  Skull,
  TrendingUp,
  BarChart3,
  Globe,
  Search,
  Filter,
  ExternalLink,
  DollarSign,
  AlertTriangle,
} from "lucide-react";

function formatMoney(n: number): string {
  if (n >= 1_000_000_000) return `$${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(0)}M`;
  return `$${(n / 1_000).toFixed(0)}K`;
}

export default function DashboardPage() {
  const { lang, t } = useLang()
  const isZh = lang === "zh"
  const [startupData, setStartupData] = useState<FailedStartup[]>(isZh ? seedDataZh : seedDataEn)
  const [stats, setStats] = useState(isZh ? deathCategoryStatsZh : deathCategoryStatsEn)
  const [patterns, setPatterns] = useState(isZh ? industryPatternsZh : industryPatternsEn)
  const [isExpanded, setIsExpanded] = useState(false)
  const [search, setSearch] = useState("");
  const [industryFilter, setIndustryFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [syncLoading, setSyncLoading] = useState(true);

  // Cache API response so language switches don't lose enriched data
  const apiDataRef = useRef<{
    startupsEn: FailedStartup[]
    startupsZh: FailedStartup[]
    statsZh: typeof deathCategoryStatsZh
    statsEn: typeof deathCategoryStatsEn
    patternsZh: typeof industryPatternsZh
    patternsEn: typeof industryPatternsEn
  } | null>(null)

  // Switch language — prefer API data, fall back to seed data
  useEffect(() => {
    const cached = apiDataRef.current
    if (cached) {
      setStartupData(isZh ? cached.startupsZh : cached.startupsEn)
      setStats(isZh ? cached.statsZh : cached.statsEn)
      setPatterns(isZh ? cached.patternsZh : cached.patternsEn)
    } else {
      setStartupData(isZh ? seedDataZh : seedDataEn)
      setStats(isZh ? deathCategoryStatsZh : deathCategoryStatsEn)
      setPatterns(isZh ? industryPatternsZh : industryPatternsEn)
    }
  }, [isZh])

  const industries = useMemo(() => [...new Set(startupData.map((s) => s.industry))].sort(), [startupData]);
  const categories = useMemo(() => Object.keys(stats) as DeathCategory[], [stats]);

  useEffect(() => {
    let cancelled = false
    fetch("/api/startups")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        return res.json()
      })
      .then((data) => {
        if (cancelled) return
        // Cache full API response for language switching
        if (data.statsZh && data.statsEn && data.industryPatternsZh && data.industryPatternsEn) {
          apiDataRef.current = {
            startupsEn: data.startups,
            startupsZh: data.startupsZh || data.startups,
            statsZh: data.statsZh,
            statsEn: data.statsEn,
            patternsZh: data.industryPatternsZh,
            patternsEn: data.industryPatternsEn,
          }
        }
        if (data.startups && data.startups.length > (isZh ? seedDataZh : seedDataEn).length) {
          setStartupData(isZh ? (data.startupsZh || data.startups) : data.startups)
          setIsExpanded(true)
        }
        if (data.statsZh && data.statsEn) {
          setStats(isZh ? data.statsZh : data.statsEn)
        }
        if (data.industryPatternsZh && data.industryPatternsEn) {
          setPatterns(isZh ? data.industryPatternsZh : data.industryPatternsEn)
        }
      })
      .catch(() => {
        // Sync is best-effort; seed data is always available
      })
      .finally(() => {
        if (!cancelled) setSyncLoading(false)
      })
    return () => { cancelled = true }
  }, [])

  const filtered = startupData.filter((s) => {
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.description.toLowerCase().includes(search.toLowerCase())) return false;
    if (industryFilter && s.industry !== industryFilter) return false;
    if (categoryFilter && s.death_category !== categoryFilter) return false;
    return true;
  });

  const totalBurned = startupData.reduce((sum, s) => sum + s.money_burned, 0);

  return (
    <main className="flex-1 px-4 py-12 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <Badge variant="outline" className="mb-4 border-purple-800 text-purple-400">
            <BarChart3 className="h-3 w-3 mr-1" /> {t("dashboard.title")}
          </Badge>
          <h1 className="text-3xl font-bold mb-3">{t("dashboard.title")}</h1>
          <p className="text-neutral-400 max-w-lg mx-auto">
            {t("dashboard.subtitle")}
          </p>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="pt-6 text-center">
              <Skull className="h-6 w-6 text-purple-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{startupData.length}+</div>
              <div className="text-xs text-neutral-500">
                {t("stats.failed")}
                {syncLoading && <span className="ml-1 text-neutral-700 animate-pulse">···</span>}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="pt-6 text-center">
              <DollarSign className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{formatMoney(totalBurned)}+</div>
              <div className="text-xs text-neutral-500">{t("stats.burned")}</div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="pt-6 text-center">
              <AlertTriangle className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{categories.length}</div>
              <div className="text-xs text-neutral-500">{isZh ? "死亡类别" : "Death Categories"}</div>
            </CardContent>
          </Card>
          <Card className="bg-neutral-900 border-neutral-800">
            <CardContent className="pt-6 text-center">
              <Globe className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <div className="text-2xl font-bold text-white">{industries.length}+</div>
              <div className="text-xs text-neutral-500">{isZh ? "行业" : "Industries"}</div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="explore" className="mb-8">
          <TabsList className="bg-neutral-800 mb-6">
            <TabsTrigger value="explore" className="text-xs">
              <Search className="h-3 w-3 mr-1" /> {t("dashboard.explore")}
            </TabsTrigger>
            <TabsTrigger value="stats" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" /> {t("dashboard.stats")}
            </TabsTrigger>
            <TabsTrigger value="industry" className="text-xs">
              <Globe className="h-3 w-3 mr-1" /> {t("dashboard.industry")}
            </TabsTrigger>
          </TabsList>

          {/* Explore Cases Tab */}
          <TabsContent value="explore">
            <div className="flex flex-wrap gap-3 mb-6">
              <div className="flex-1 min-w-[200px]">
                <label htmlFor="startup-search" className="sr-only">{isZh ? "搜索公司" : "Search startups"}</label>
                <input
                  id="startup-search"
                  type="text"
                  placeholder={isZh ? "搜索公司..." : "Search startups..."}
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm text-white placeholder:text-neutral-500 focus:outline-none focus:border-purple-500"
                />
              </div>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">{isZh ? "所有行业" : "All Industries"}</option>
                {industries.map((ind) => (
                  <option key={ind} value={ind}>{ind}</option>
                ))}
              </select>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-neutral-900 border border-neutral-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              >
                <option value="">{isZh ? "所有死因" : "All Death Causes"}</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{getDeathCategoryLabel(cat, lang)}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((startup) => (
                <Card key={startup.id} className="bg-neutral-900 border-neutral-800 hover:border-neutral-700 transition-colors">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between mb-3">
                      <h3 className="font-bold text-white">{startup.name}</h3>
                      <Badge variant="outline" className="text-[10px]">
                        {startup.industry}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-400 mb-3 line-clamp-2">{startup.description}</p>
                    <div className="flex flex-wrap gap-1 mb-3">
                      <Badge className="bg-red-400/10 text-red-400 text-[10px]">
                        {getDeathCategoryLabel(startup.death_category, lang)}
                      </Badge>
                      <Badge variant="secondary" className="text-[10px] bg-neutral-800">
                        {formatMoney(startup.money_burned)} {isZh ? "烧掉" : "burned"}
                      </Badge>
                    </div>
                    <p className="text-xs text-neutral-500 mb-2">{isZh ? "死因" : "Cause"}: {startup.cause_of_death}</p>
                    <div className="border-t border-neutral-800 pt-3 mt-3">
                      <p className="text-xs text-yellow-400 font-medium mb-1">{isZh ? "教训" : "Lesson"}:</p>
                      <p className="text-xs text-neutral-300">{startup.lessons_learned[0]}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="text-center text-neutral-500 py-12">{isZh ? "没有匹配的案例。" : "No startups match your filters."}</p>
            )}
          </TabsContent>

          {/* Death Stats Tab */}
          <TabsContent value="stats">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((cat) => {
                const stat = stats[cat];
                return (
                  <Card key={cat} className="bg-neutral-900 border-neutral-800">
                    <CardContent className="pt-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-white text-sm">{getDeathCategoryLabel(cat, lang)}</h3>
                        <span className="text-lg font-bold text-red-400">{stat.lethality}%</span>
                      </div>
                      <p className="text-xs text-neutral-400">{stat.description}</p>
                      <div className="mt-3 bg-neutral-800 rounded-full h-2">
                        <div
                          className="bg-red-400 h-2 rounded-full"
                          style={{ width: `${stat.lethality}%` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          {/* Industry Patterns Tab */}
          <TabsContent value="industry">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(patterns).map(([industry, patternList]) => (
                <Card key={industry} className="bg-neutral-900 border-neutral-800">
                  <CardHeader>
                    <CardTitle className="text-base flex items-center gap-2">
                      <Badge variant="outline">{industry}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {patternList.map((p, i) => (
                        <li key={i} className="text-sm text-neutral-300 flex items-start gap-2">
                          <AlertTriangle className="h-4 w-4 text-yellow-400 mt-0.5 shrink-0" />
                          {p}
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="my-8" />

        <div className="text-center">
          <p className="text-neutral-500 text-sm mb-4">
            {t("dashboard.ready")}
          </p>
          <Link href="/analyze" className={buttonVariants({ size: "lg", className: "bg-purple-600 hover:bg-purple-500" })}>
            {t("dashboard.analyze")}
          </Link>
        </div>
    </main>
  );
}
