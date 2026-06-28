import { query, queryOne, execute, generateId } from '@/lib/db'
import { tenantWhere } from '@/lib/tenant'
import { completeWithLlmMessages, isAiLlmEnabled } from './llm'
import { buildTenantAiContext, formatTenantContextForPrompt } from './tenant-context'

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface ChatSession {
  id: string
  tenant_id: string
  user_id: string
  title: string
  messages: ChatMessage[]
  updated_at: string
  created_at: string
}

function parseMessages(raw: string | ChatMessage[]): ChatMessage[] {
  if (Array.isArray(raw)) return raw
  try {
    return JSON.parse(raw) as ChatMessage[]
  } catch {
    return []
  }
}

function ruleBasedReply(message: string, ctx?: Awaited<ReturnType<typeof buildTenantAiContext>>): string {
  const lower = message.toLowerCase().trim()

  if (ctx && /margin|revenue|profit|finance|accounting|trial balance/.test(lower)) {
    return `Finance snapshot: posted revenue KES ${Number(ctx.finance.revenuePosted).toLocaleString()}, expenses KES ${Number(ctx.finance.expensesPosted).toLocaleString()}, net income KES ${Number(ctx.finance.netIncome).toLocaleString()} (${ctx.finance.glAccounts} GL accounts). Open Accounting → Reports for detail.`
  }
  if (ctx && /stock|inventory|reorder|sku/.test(lower)) {
    return `Inventory: ${ctx.inventory.critical} critical and ${ctx.inventory.low} low-stock SKU(s). ${ctx.inventory.topReorder.length ? `Top reorder: ${ctx.inventory.topReorder.join('; ')}.` : 'Stock levels look stable.'}`
  }
  if (ctx && /alert|cold|temperature|haccp/.test(lower)) {
    return `Cold chain: ${ctx.coldchain.openAlerts} open alert(s), ${ctx.coldchain.temperatureReadings30d} readings in last 30 days. ${ctx.alerts.filter((a) => a.includes('cold')).join(' ') || 'Check Cold Storage → Alerts.'}`
  }

  if (/hello|hi|hey|greetings/.test(lower)) {
    return 'Hello! I am the AquaERP AI assistant with live tenant metrics when LLM is enabled. Ask about catches, margins, inventory, or cold chain.'
  }
  if (/catch|landing|trip|fleet|boat/.test(lower)) {
    return 'BMU operations: log catches under Trips & Catches, track lots in Traceability, and schedule landing-site auctions.'
  }
  if (/cold|temperature|haccp|storage|spoilage/.test(lower)) {
    return 'Cold chain: monitor zones and readings in Cold Storage. Critical temperature events trigger workflow alerts.'
  }
  if (/order|commerce|marketplace|checkout|cart/.test(lower)) {
    return 'Commerce: manage catalog, orders, and checkout from the Marketplace module. Order confirmations can trigger buyer notifications.'
  }
  if (/payroll|leave|attendance|hr|employee/.test(lower)) {
    return 'HR: employees, attendance, leave, payroll, performance reviews, and training records are under Human Resources.'
  }
  if (/auction|bid|lot/.test(lower)) {
    return 'Auctions: schedule fish auctions at landing sites and place live bids linked to traceability lot codes.'
  }
  if (/forecast|ai|demand|price|fraud/.test(lower)) {
    return 'AI insights: demand forecasts, price predictions, fraud checks, and business briefs are on AI & Automation. Run daily automation or Recompute models.'
  }
  if (/report|executive|kpi/.test(lower)) {
    return 'Reports: Analytics → Reports hub delivers CSV/HTML with optional AI narrative when OPENAI_API_KEY is set.'
  }
  if (/help|what can you/.test(lower)) {
    return 'I can answer using your tenant data (orders, catch, cold chain, finance, inventory). Try: "What should I reorder?" or "Summarize our week".'
  }

  return 'I did not find a specific match. Try asking about revenue, inventory, cold chain, or type "help" for topics.'
}

export async function listChatSessions(
  tenantId: string,
  userId: string,
): Promise<ChatSession[]> {
  const rows = await query<{
    id: string
    tenant_id: string
    user_id: string
    title: string
    messages: string | ChatMessage[]
    updated_at: string
    created_at: string
  }>(
    `SELECT * FROM ai_chat_sessions
     WHERE ${tenantWhere()} AND user_id = ?
     ORDER BY updated_at DESC
     LIMIT 20`,
    [tenantId, userId],
  )

  return rows.map((r) => ({
    ...r,
    messages: parseMessages(r.messages),
  }))
}

export async function getOrCreateSession(
  tenantId: string,
  userId: string,
  sessionId?: string,
): Promise<ChatSession> {
  if (sessionId) {
    const existing = await queryOne<{
      id: string
      tenant_id: string
      user_id: string
      title: string
      messages: string | ChatMessage[]
      updated_at: string
      created_at: string
    }>(
      `SELECT * FROM ai_chat_sessions WHERE id = ? AND ${tenantWhere()} AND user_id = ?`,
      [sessionId, tenantId, userId],
    )
    if (existing) {
      return { ...existing, messages: parseMessages(existing.messages) }
    }
  }

  const id = generateId()
  const messages: ChatMessage[] = [
    {
      role: 'assistant',
      content: isAiLlmEnabled()
        ? 'Welcome to AquaERP AI Assistant — I can answer using your live business metrics. How can I help?'
        : 'Welcome to AquaERP Assistant (rules mode). Set OPENAI_API_KEY for AI-powered answers with your tenant data.',
      timestamp: new Date().toISOString(),
    },
  ]

  await execute(
    `INSERT INTO ai_chat_sessions (id, tenant_id, user_id, title, messages)
     VALUES (?, ?, ?, ?, ?)`,
    [id, tenantId, userId, 'AquaERP Assistant', JSON.stringify(messages)],
  )

  const session = await queryOne<{
    id: string
    tenant_id: string
    user_id: string
    title: string
    messages: string | ChatMessage[]
    updated_at: string
    created_at: string
  }>(
    `SELECT * FROM ai_chat_sessions WHERE id = ?`,
    [id],
  )
  if (!session) throw new Error('Failed to create chat session')
  return { ...session, messages }
}

export async function sendChatMessage(
  tenantId: string,
  userId: string,
  sessionId: string,
  message: string,
): Promise<ChatSession & { aiMode: string }> {
  const session = await getOrCreateSession(tenantId, userId, sessionId)
  const messages = [...session.messages]

  messages.push({
    role: 'user',
    content: message.trim(),
    timestamp: new Date().toISOString(),
  })

  const ctx = await buildTenantAiContext(tenantId)
  let reply: string
  let aiMode = 'rules'

  if (isAiLlmEnabled()) {
    const history = messages
      .filter((m) => m.role === 'user' || m.role === 'assistant')
      .slice(-8)
      .map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      }))

    const systemPrompt = `You are AquaERP AI advisor for fishing, seafood, cold chain, commerce, HR, and finance in Kenya.
Use the tenant JSON metrics below as ground truth. Be concise, actionable, and cite numbers when relevant.
If asked for actions, give numbered steps. Do not invent metrics not in the JSON.

Tenant metrics:
${formatTenantContextForPrompt(ctx)}`

    const llmMessages = [
      { role: 'system' as const, content: systemPrompt },
      ...history,
    ]
    const llmReply = await completeWithLlmMessages(llmMessages, { maxTokens: 600 })
    if (llmReply) {
      reply = llmReply
      aiMode = 'llm_grounded'
    } else {
      reply = ruleBasedReply(message, ctx)
    }
  } else {
    reply = ruleBasedReply(message, ctx)
  }

  messages.push({
    role: 'assistant',
    content: reply,
    timestamp: new Date().toISOString(),
  })

  await execute(
    `UPDATE ai_chat_sessions SET messages = ?, updated_at = NOW() WHERE id = ? AND ${tenantWhere()}`,
    [JSON.stringify(messages), sessionId, tenantId],
  )

  return { ...session, messages, aiMode }
}
