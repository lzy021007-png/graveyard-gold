"use client"

import { useLang } from "@/lib/i18n/language-context"

const content = {
  en: {
    title: "Privacy Policy",
    lastUpdated: "Last updated: May 25, 2026",
    sections: [
      {
        heading: "1. Data We Collect",
        body: "We collect the startup ideas and optional details (industry, stage) you submit for analysis. We also collect anonymous usage data through Google Analytics, including page views and interaction events. We do not use cookies for tracking.",
      },
      {
        heading: "2. How We Use Your Data",
        body: "Your startup ideas are sent to our AI provider (DeepSeek) solely for the purpose of generating your analysis report. We do not store, sell, or share your ideas with third parties. Analysis reports are saved temporarily to generate shareable links and may be deleted after 30 days.",
      },
      {
        heading: "3. Data Storage",
        body: "Reports are stored on our secure servers. You can request deletion of your data at any time by contacting us. We do not maintain user accounts, so reports are anonymous and tied only to the unique URL generated for your analysis.",
      },
      {
        heading: "4. Third-Party Services",
        body: "We use the following third-party services:\n• DeepSeek / Anthropic API — to generate AI analysis reports\n• Vercel — for hosting and serverless functions\n• Supabase — for database storage\n• Google Analytics — for anonymous usage analytics\nThese services have their own privacy policies governing how they handle data.",
      },
      {
        heading: "5. Your Rights",
        body: "You have the right to access, correct, or delete any personal data we hold about you. Since we do not require accounts, there is no persistent personal data stored. To request deletion of an analysis report, contact us with the report URL.",
      },
      {
        heading: "6. Contact",
        body: "For privacy-related inquiries, contact us at privacy@graveyardgold.com or through the contact information on our website.",
      },
    ],
  },
  zh: {
    title: "隐私政策",
    lastUpdated: "最后更新：2026 年 5 月 25 日",
    sections: [
      {
        heading: "1. 我们收集的数据",
        body: "我们收集您提交的创业想法和可选信息（行业、阶段）用于分析。我们还通过 Google Analytics 收集匿名使用数据，包括页面浏览量和交互事件。我们不使用 Cookie 进行追踪。",
      },
      {
        heading: "2. 我们如何使用您的数据",
        body: "您的创业想法仅会被发送至我们的 AI 服务提供商（DeepSeek），用于生成分析报告。我们不会存储、出售或与第三方分享您的想法。分析报告会临时保存以生成可分享链接，30 天后可能被删除。",
      },
      {
        heading: "3. 数据存储",
        body: "报告存储在我们的安全服务器上。您可以随时联系我们请求删除数据。我们不维护用户账户，因此报告是匿名的，仅与分析生成的唯一 URL 关联。",
      },
      {
        heading: "4. 第三方服务",
        body: "我们使用以下第三方服务：\n• DeepSeek / Anthropic API — 生成 AI 分析报告\n• Vercel — 托管和 serverless 函数\n• Supabase — 数据库存储\n• Google Analytics — 匿名使用分析\n这些服务有各自的隐私政策来规范数据处理。",
      },
      {
        heading: "5. 您的权利",
        body: "您有权访问、更正或删除我们持有的关于您的任何个人数据。由于我们不要求注册账户，不会有持久的个人数据存储。要请求删除分析报告，请通过报告 URL 联系我们。",
      },
      {
        heading: "6. 联系方式",
        body: "有关隐私问题，请通过 privacy@graveyardgold.com 或我们网站上的联系信息与我们联系。",
      },
    ],
  },
}

export default function PrivacyPage() {
  let lang = "en" as "en" | "zh"
  try {
    const ctx = useLang()
    lang = ctx.lang
  } catch {
    // useLang may not be available
  }
  const t = content[lang]

  return (
    <main className="flex-1 px-4 py-12 max-w-2xl mx-auto w-full">
      <h1 className="text-3xl font-bold mb-2">{t.title}</h1>
      <p className="text-sm text-neutral-500 mb-8">{t.lastUpdated}</p>
      <div className="space-y-6">
        {t.sections.map((section, i) => (
          <section key={i}>
            <h2 className="text-lg font-semibold mb-2">{section.heading}</h2>
            <p className="text-sm text-neutral-400 whitespace-pre-line leading-relaxed">{section.body}</p>
          </section>
        ))}
      </div>
    </main>
  )
}
