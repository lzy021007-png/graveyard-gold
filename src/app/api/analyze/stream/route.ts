import { NextRequest } from 'next/server'
import { SYSTEM_PROMPT, buildUserPrompt, SYSTEM_PROMPT_ZH, buildUserPromptZH } from '@/lib/ai/prompts'
import { checkRateLimit } from '@/lib/rate-limit'

async function getClient() {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error('AI service is not configured')
  }
  const { default: Anthropic } = await import('@anthropic-ai/sdk')
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
    baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com',
  })
}

export async function POST(request: NextRequest) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  const rate = checkRateLimit(ip, 10, 15 * 60 * 1000)
  if (!rate.allowed) {
    return new Response(
      JSON.stringify({ error: 'Too many requests. Please wait a few minutes and try again.' }),
      { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(Math.ceil((rate.resetAt - Date.now()) / 1000)) } }
    )
  }

  const body = await request.json()
  const { idea, industry, stage, mode = 'full', lang = 'en' } = body

  if (!idea || idea.trim().length < 10) {
    return new Response(
      JSON.stringify({ error: 'Please provide a more detailed idea (at least 10 characters)' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  }

  const anthropic = await getClient()
  const isZh = lang === 'zh'

  const systemPrompt = isZh ? SYSTEM_PROMPT_ZH : SYSTEM_PROMPT
  const userPrompt = isZh
    ? buildUserPromptZH(idea, industry, stage)
    : buildUserPrompt(idea, industry, stage)

  const model = process.env.ANTHROPIC_MODEL || 'deepseek-v4-pro'

  const maxTokens = mode === 'quick' ? 2048 : 8192

  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    async start(controller) {
      try {
        const response = await fetch(
          `${process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com'}/v1/messages`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'x-api-key': process.env.ANTHROPIC_API_KEY!,
              'anthropic-version': '2023-06-01',
            },
            body: JSON.stringify({
              model,
              max_tokens: maxTokens,
              system: systemPrompt,
              messages: [{ role: 'user', content: userPrompt }],
              stream: true,
              thinking: { type: 'disabled' },
            }),
          }
        )

        if (!response.ok) {
          const err = await response.text()
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: err })}\n\n`))
          controller.close()
          return
        }

        const reader = response.body?.getReader()
        if (!reader) {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: 'No response body' })}\n\n`))
          controller.close()
          return
        }

        const decoder = new TextDecoder()
        let buffer = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split('\n')
          buffer = lines.pop() || ''

          for (const line of lines) {
            const trimmed = line.trim()
            if (!trimmed || !trimmed.startsWith('data: ')) continue

            const data = trimmed.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)

              if (parsed.type === 'content_block_delta') {
                const text = parsed.delta?.text || ''
                if (text) {
                  controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'text', text })}\n\n`))
                }
              } else if (parsed.type === 'message_start') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'start', model: parsed.message?.model })}\n\n`))
              } else if (parsed.type === 'message_stop') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
              }
            } catch {
              // skip unparseable lines
            }
          }
        }

        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'done' })}\n\n`))
        controller.close()
      } catch (error) {
        const msg = error instanceof Error ? error.message : 'Unknown error'
        controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'error', message: msg })}\n\n`))
        controller.close()
      }
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      Connection: 'keep-alive',
    },
  })
}
