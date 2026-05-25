import { NextRequest, NextResponse } from 'next/server'
import { analyzeIdea, quickScan } from '@/lib/ai/analyzer'
import { checkRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = checkRateLimit(ip, 10, 15 * 60 * 1000)
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many requests. Please wait a few minutes and try again.' },
      { status: 429, headers: { 'Retry-After': String(Math.ceil((rate.resetAt - Date.now()) / 1000)) } }
    )
  }

  try {
    const body = await request.json()
    const { idea, industry, stage, mode = 'full' } = body

    if (!idea || idea.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please provide a more detailed idea (at least 10 characters)' },
        { status: 400 }
      )
    }

    if (mode === 'quick') {
      const result = await quickScan(idea)
      return NextResponse.json(result)
    }

    const report = await analyzeIdea(idea, industry, stage)
    return NextResponse.json(report)
  } catch (error) {
    console.error('Analysis error:', error instanceof Error ? error.message : 'Unknown error')
    return NextResponse.json(
      { error: 'Analysis failed. Please try again later.' },
      { status: 500 }
    )
  }
}
