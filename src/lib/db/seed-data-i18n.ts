import type { DeathCategory } from '@/lib/types'

export const deathCategoryStatsEn: Record<DeathCategory, { lethality: number; description: string }> = {
  product_problems: { lethality: 85.6, description: 'Buggy product, poor UX, quality issues, didn\'t solve the real problem' },
  competition: { lethality: 82.7, description: 'Out-competed, couldn\'t differentiate, market too crowded' },
  unit_economics: { lethality: 62.6, description: 'Lost money on every sale, CAC > LTV, negative margins' },
  operations: { lethality: 54.2, description: 'Couldn\'t scale operations, logistics failure, supply chain collapse' },
  run_out_of_cash: { lethality: 53.1, description: 'Burned through funding, couldn\'t raise next round' },
  team_issues: { lethality: 48.7, description: 'Founder disputes, missing key talent, wrong hires' },
  no_market_need: { lethality: 36.2, description: 'Solving a problem nobody has, wrong timing, market too small' },
  regulatory: { lethality: 31.5, description: 'Policy changes, sudden regulatory crackdown' },
  pivot_gone_wrong: { lethality: 22.8, description: 'Pivoted into a worse position, lost original traction' },
  tech_failure: { lethality: 18.4, description: 'Core technology didn\'t work, couldn\'t scale technically' },
  legal_issues: { lethality: 14.3, description: 'Lawsuits, IP disputes, compliance failures' },
}

export const deathCategoryStatsZh: Record<DeathCategory, { lethality: number; description: string }> = {
  product_problems: { lethality: 85.6, description: 'Bug多、体验差、质量低劣、没解决真实问题' },
  competition: { lethality: 82.7, description: '被对手干掉、无法差异化、市场太拥挤' },
  unit_economics: { lethality: 62.6, description: '卖一单亏一单、CAC > LTV、利润率为负' },
  operations: { lethality: 54.2, description: '无法规模化、物流崩溃、供应链断裂' },
  run_out_of_cash: { lethality: 53.1, description: '烧光资金、无法继续融资' },
  team_issues: { lethality: 48.7, description: '创始人内讧、关键人才缺失、招错人' },
  no_market_need: { lethality: 36.2, description: '解决一个没人有的问题、时机不对、市场太小' },
  regulatory: { lethality: 31.5, description: '政策变化、监管突然收紧' },
  pivot_gone_wrong: { lethality: 22.8, description: '转型转进坑里、失去原有优势' },
  tech_failure: { lethality: 18.4, description: '核心技术不work、无法规模化' },
  legal_issues: { lethality: 14.3, description: '诉讼、知识产权纠纷、合规问题' },
}

export const industryPatternsEn: Record<string, string[]> = {
  'E-commerce': ['83% died from competition', '70% from operational issues', 'Logistics and returns are the biggest hidden killers'],
  'Healthcare': ['94% died from regulatory issues', 'B2B models vastly outperform B2C', 'Decision-maker ≠ payer ≠ user'],
  'Hardware': ['96% died from product problems', '76% ran out of cash', 'Hardware requires 10x the capital of software'],
  'SaaS': ['High competition (low barrier to entry)', 'CAC is the key metric', 'Retention below 90% makes profitability impossible'],
  'FinTech': ['Regulation is the #1 risk', 'Compliance costs are systematically underestimated', 'User trust takes years to build'],
  'EdTech': ['Extreme policy risk', 'School/enterprise sales cycles are 6-18 months', 'B2C CAC far exceeds expectations'],
  'Food & Beverage': ['Low gross margins (typically 5-15%)', 'Supply chain is the core competency', 'A single food safety incident can kill the company instantly'],
  'Social Media': ['Extremely high network effect barriers', 'Content moderation costs grow exponentially', 'User tastes shift very quickly'],
  'Marketplace': ['Chicken-and-egg cold start problem', 'Trust building between supply and demand sides', 'Liquidity is the single most important metric'],
}

export const industryPatternsZh: Record<string, string[]> = {
  'E-commerce': ['83% 死于竞争', '70% 死于运营问题', '物流和退货成本是最大隐性杀手'],
  'Healthcare': ['94% 死于监管红线', 'B2B 模式远优于 B2C', '医疗决策者≠付费者≠使用者'],
  'Hardware': ['96% 死于产品问题', '76% 烧光现金', '硬件创业资金需求是软件的 10 倍以上'],
  'SaaS': ['高竞争（低门槛）', '获客成本是关键', '留存率低于 90% 不可能盈利'],
  'FinTech': ['监管是最大风险', '合规成本容易被低估', '用户信任建立周期极长'],
  'EdTech': ['政策风险极高', '学校/机构的销售周期极长（6-18 个月）', 'B2C 获客成本远超预期'],
  'Food & Beverage': ['毛利率低（通常 5-15%）', '供应链管理是核心竞争力', '食品安全事故可瞬间杀死公司'],
  'Social Media': ['网络效应门槛极高', '内容审核成本呈指数增长', '用户口味变化极快'],
  'Marketplace': ['先有鸡还是先有蛋的冷启动问题', '供需双方的信任建立', '流动性是最重要指标'],
}
