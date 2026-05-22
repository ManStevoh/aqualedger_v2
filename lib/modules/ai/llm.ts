import { getOpenAiChatCompletionsUrl } from '@/lib/config/external-apis'
import { logger } from '@/lib/logger'

export type LlmMessage = { role: 'system' | 'user' | 'assistant'; content: string }

export function isAiLlmEnabled(): boolean {
  const key = process.env.OPENAI_API_KEY?.trim()
  return Boolean(key && key.length > 10)
}

export function getAiModelLabel(): string {
  if (!isAiLlmEnabled()) return 'rules_and_statistics_v1'
  return process.env.OPENAI_MODEL?.trim() || 'gpt-4o-mini'
}

export async function completeWithLlm(
  systemPrompt: string,
  userMessage: string,
  opts?: { maxTokens?: number; temperature?: number },
): Promise<string | null> {
  return completeWithLlmMessages(
    [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: userMessage },
    ],
    opts,
  )
}

export async function completeWithLlmMessages(
  messages: LlmMessage[],
  opts?: { maxTokens?: number; temperature?: number },
): Promise<string | null> {
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) return null

  try {
    const res = await fetch(getOpenAiChatCompletionsUrl(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        max_tokens: opts?.maxTokens ?? 900,
        temperature: opts?.temperature ?? 0.25,
      }),
    })
    if (!res.ok) {
      logger.error('OpenAI error', { status: res.status })
      return null
    }
    const data = (await res.json()) as {
      choices?: { message?: { content?: string } }[]
    }
    return data.choices?.[0]?.message?.content?.trim() ?? null
  } catch (err) {
    logger.error('LLM request failed', { error: err })
    return null
  }
}
