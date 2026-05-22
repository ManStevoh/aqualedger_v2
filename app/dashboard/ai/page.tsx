'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Input } from '@/components/ui/input'
import { Sparkles, TrendingUp, RefreshCw, ShieldAlert, DollarSign, Send, MessageCircle } from 'lucide-react'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { DataTable } from '@/components/dashboard/data-table'

interface ForecastPoint {
  date: string
  predicted_kg: number
  confidence_pct: number
}

interface PricePrediction {
  species: string
  current_avg_price: number
  predicted_price: number
  trend_pct: number
  data_points: number
  model: string
}

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

interface FraudAlert {
  transaction_id: string
  wallet_id: string
  user_id: string
  amount: number
  type: string
  reference: string
  created_at: string
  reason: string
  severity: 'warning' | 'critical'
  z_score: number
}

interface AiInsight {
  id: string
  title: string
  summary: string
  recommendations: string[]
  model_version: string
  created_at: string
}

interface InventoryRow {
  productName: string
  sku: string
  currentKg: number
  daysOfStock: number
  reorderKg: number
  urgency: string
}

export default function AiInsightsPage() {
  const meta = useDashboardPageMeta()

  const chatRef = useRef<HTMLDivElement>(null)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [chatInput, setChatInput] = useState('')
  const [chatLoading, setChatLoading] = useState(false)
  const [sending, setSending] = useState(false)

  const [chartData, setChartData] = useState<Record<string, ForecastPoint[]>>({})
  const [pricing, setPricing] = useState<PricePrediction[]>([])
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [aiEnabled, setAiEnabled] = useState(false)
  const [aiModel, setAiModel] = useState('rules_and_statistics_v1')
  const [businessBrief, setBusinessBrief] = useState<AiInsight | null>(null)
  const [coldReview, setColdReview] = useState<AiInsight | null>(null)
  const [inventoryReview, setInventoryReview] = useState<AiInsight | null>(null)
  const [inventoryRows, setInventoryRows] = useState<InventoryRow[]>([])
  const [insightsLoading, setInsightsLoading] = useState(false)
  const [automationBusy, setAutomationBusy] = useState(false)

  const fetchForecasts = async (refresh = false) => {
    if (refresh) setRefreshing(true)
    else setLoading(true)
    try {
      const url = refresh
        ? '/api/v2/ai/forecast?refresh=true&days=14'
        : '/api/v2/ai/forecast?days=14'
      const res = await authFetchJson<{
        success: boolean
        data?: { chartData: Record<string, ForecastPoint[]>; forecasts: unknown[] }
      }>(url)
      if (res.success && res.data?.chartData) {
        setChartData(res.data.chartData)
      } else {
        setChartData({})
      }
    } catch {
      toast.error('Could not load forecasts')
      setChartData({})
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const fetchPricingAndFraud = async () => {
    try {
      const [priceRes, fraudRes] = await Promise.all([
        authFetchJson<{ success: boolean; data?: { predictions: PricePrediction[] } }>(
          '/api/v2/ai/pricing',
        ),
        authFetchJson<{ success: boolean; data?: { alerts: FraudAlert[] } }>(
          '/api/v2/ai/fraud-check',
        ),
      ])
      if (priceRes.success && priceRes.data?.predictions) {
        setPricing(priceRes.data.predictions)
      } else {
        setPricing([])
      }
      if (fraudRes.success && fraudRes.data?.alerts) {
        setFraudAlerts(fraudRes.data.alerts)
      } else {
        setFraudAlerts([])
      }
    } catch {
      setPricing([])
      setFraudAlerts([])
    }
  }

  const loadChat = async () => {
    setChatLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { session: { id: string; messages: ChatMessage[] } }
      }>('/api/v2/ai/chat')
      if (res.success && res.data?.session) {
        setSessionId(res.data.session.id)
        setChatMessages(res.data.session.messages)
      }
    } catch {
      setChatMessages([])
    } finally {
      setChatLoading(false)
    }
  }

  const sendMessage = async () => {
    const text = chatInput.trim()
    if (!text) return
    setSending(true)
    setChatInput('')
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { session: { id: string; messages: ChatMessage[] } }
        error?: string
      }>('/api/v2/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sessionId: sessionId ?? undefined, message: text }),
      })
      if (res.success && res.data?.session) {
        setSessionId(res.data.session.id)
        setChatMessages(res.data.session.messages)
      } else {
        toast.error(res.error || 'Could not send message')
      }
    } catch {
      toast.error('Chat unavailable')
    } finally {
      setSending(false)
    }
  }

  const fetchInsights = useCallback(async () => {
    setInsightsLoading(true)
    try {
      const [insRes, invRes] = await Promise.all([
        authFetchJson<{
          success: boolean
          data?: {
            aiEnabled: boolean
            model: string
            insights: {
              businessBrief: AiInsight | null
              coldchainReview: AiInsight | null
              inventoryReview: AiInsight | null
            }
          }
        }>('/api/v2/ai/insights'),
        authFetchJson<{ success: boolean; data?: { predictions: InventoryRow[] } }>(
          '/api/v2/ai/inventory',
        ),
      ])
      if (insRes.success && insRes.data) {
        setAiEnabled(insRes.data.aiEnabled)
        setAiModel(insRes.data.model)
        setBusinessBrief(insRes.data.insights.businessBrief)
        setColdReview(insRes.data.insights.coldchainReview)
        setInventoryReview(insRes.data.insights.inventoryReview)
      }
      if (invRes.success && invRes.data?.predictions) {
        setInventoryRows(invRes.data.predictions.filter((p) => p.urgency !== 'ok').slice(0, 12))
      }
    } catch {
      /* optional */
    } finally {
      setInsightsLoading(false)
    }
  }, [])

  const runAutomation = async () => {
    setAutomationBusy(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>(
        '/api/v2/ai/insights',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'run_all' }),
        },
      )
      if (!res.success) {
        toast.error(res.error || 'Automation failed')
        return
      }
      toast.success('AI models and briefs updated')
      await Promise.all([fetchForecasts(true), fetchPricingAndFraud(), fetchInsights()])
    } catch {
      toast.error('Automation failed')
    } finally {
      setAutomationBusy(false)
    }
  }

  useEffect(() => {
    fetchForecasts()
    fetchPricingAndFraud()
    loadChat()
    fetchInsights()
    if (typeof window !== 'undefined' && window.location.hash === '#chat') {
      setTimeout(() => chatRef.current?.scrollIntoView({ behavior: 'smooth' }), 400)
    }
  }, [fetchInsights])

  const speciesList = Object.keys(chartData)
  const primarySpecies = speciesList[0]
  const lineData = useMemo(() => {
    if (!primarySpecies) return []
    return chartData[primarySpecies] ?? []
  }, [chartData, primarySpecies])

  const avgConfidence =
    lineData.length > 0
      ? Math.round(lineData.reduce((s, p) => s + p.confidence_pct, 0) / lineData.length)
      : 0

  const trendPct =
    lineData.length >= 2
      ? Math.round(
          ((lineData[lineData.length - 1].predicted_kg - lineData[0].predicted_kg) /
            Math.max(lineData[0].predicted_kg, 0.001)) *
            100,
        )
      : 0

  return (
    <DashboardPageLayout title={meta.title} description={meta.description} breadcrumbs={meta.breadcrumbs} actions={<><div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            disabled={refreshing}
            onClick={() => {
              fetchForecasts(true)
              fetchPricingAndFraud()
              fetchInsights()
            }}
          >
            <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
            Recompute
          </Button>
          <Button className="gap-2" disabled={automationBusy} onClick={runAutomation}>
            {automationBusy ? 'Running…' : 'Run full AI automation'}
          </Button>
        </div></>}>

      <Card id="brief">
        <CardHeader>
          <CardTitle>AI Business Brief</CardTitle>
          <CardDescription>
            Cross-module analysis: fleet, commerce, finance, cold chain, CRM, inventory
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insightsLoading && !businessBrief ? (
            <p className="text-sm text-muted-foreground">Loading brief…</p>
          ) : businessBrief ? (
            <>
              <p className="text-sm leading-relaxed">{businessBrief.summary}</p>
              {businessBrief.recommendations.length > 0 && (
                <ul className="list-disc pl-5 text-sm space-y-1">
                  {businessBrief.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              )}
              <p className="text-xs text-muted-foreground">
                {businessBrief.model_version} · {new Date(businessBrief.created_at).toLocaleString()}
              </p>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              No brief yet. Click &quot;Run full AI automation&quot; to generate.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Demand forecast
            </CardTitle>
            <CardDescription>
              {primarySpecies
                ? `${primarySpecies} — next ${lineData.length} days (moving_avg_v1)`
                : 'Run recompute after catches/listings exist'}
            </CardDescription>
          </div>
          <Badge variant="secondary">Live model</Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <p className="text-sm text-muted-foreground py-12 text-center">Loading forecast…</p>
          ) : lineData.length === 0 ? (
            <p className="text-sm text-muted-foreground py-12 text-center">
              No forecast data yet. Log catches or sales, then click Recompute.
            </p>
          ) : (
            <>
              <div className="flex items-baseline gap-3">
                <p className="text-3xl font-bold tracking-tight">
                  {trendPct >= 0 ? '+' : ''}
                  {trendPct}%
                </p>
                <p className="text-sm text-muted-foreground">projected trend over forecast window</p>
              </div>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={lineData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => [`${v.toFixed(1)} kg`, 'Predicted']} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="predicted_kg"
                    stroke="#8b5cf6"
                    strokeWidth={2}
                    name="Predicted kg"
                  />
                </LineChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Model confidence</span>
                  <span>{avgConfidence}%</span>
                </div>
                <Progress value={avgConfidence} />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {speciesList.length > 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">All species forecasted</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {speciesList.map((s) => (
              <Badge key={s} variant="outline">
                {s} ({chartData[s]?.length ?? 0} days)
              </Badge>
            ))}
          </CardContent>
        </Card>
      )}

      <DataTable
        title="Price predictions"
        description="Simple linear regression from historical catch unit prices (linear_v1)"
        loading={loading}
        data={pricing}
        emptyMessage="Log catches with unit prices to generate species price forecasts"
        columns={[
          { key: 'species', header: 'Species' },
          {
            key: 'current_avg_price',
            header: 'Current avg',
            cell: (row) => `KES ${row.current_avg_price.toLocaleString()}/kg`,
          },
          {
            key: 'predicted_price',
            header: 'Predicted',
            cell: (row) => `KES ${row.predicted_price.toLocaleString()}/kg`,
          },
          {
            key: 'trend_pct',
            header: 'Trend',
            cell: (row) => (
              <span className={row.trend_pct >= 0 ? 'text-emerald-600' : 'text-red-600'}>
                {row.trend_pct >= 0 ? '+' : ''}
                {row.trend_pct}%
              </span>
            ),
          },
          { key: 'data_points', header: 'Samples' },
          {
            key: 'model',
            header: 'Model',
            cell: (row) => <Badge variant="outline">{row.model}</Badge>,
          },
        ]}
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between space-y-0">
          <div className="space-y-1">
            <CardTitle className="text-lg flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              Fraud alerts
            </CardTitle>
            <CardDescription>
              Unusual wallet transaction amounts flagged by z-score and absolute thresholds
            </CardDescription>
          </div>
          <Badge variant={fraudAlerts.length > 0 ? 'destructive' : 'secondary'}>
            {fraudAlerts.length} flagged
          </Badge>
        </CardHeader>
        <CardContent>
          {loading ? (
            <p className="text-sm text-muted-foreground py-6 text-center">Scanning wallet activity…</p>
          ) : fraudAlerts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No unusual wallet amounts detected in the last 90 days.
            </p>
          ) : (
            <div className="space-y-3">
              {fraudAlerts.map((alert) => (
                <div
                  key={alert.transaction_id}
                  className="flex flex-col gap-1 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="font-medium flex items-center gap-2">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      KES {alert.amount.toLocaleString()} · {alert.type}
                      <Badge variant={alert.severity === 'critical' ? 'destructive' : 'secondary'}>
                        {alert.severity}
                      </Badge>
                    </p>
                    <p className="text-sm text-muted-foreground">{alert.reason}</p>
                    <p className="text-xs text-muted-foreground font-mono mt-1">
                      {alert.reference} · z={alert.z_score}
                    </p>
                  </div>
                  <p className="text-xs text-muted-foreground whitespace-nowrap">
                    {new Date(alert.created_at).toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card ref={chatRef} id="ai-chat">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageCircle className="h-5 w-5" />
            AquaERP Assistant
          </CardTitle>
          <CardDescription>
            Answers use live tenant KPIs{aiEnabled ? ' + OpenAI' : ' (rules mode)'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-64 overflow-y-auto rounded-lg border bg-muted/30 p-3 space-y-3">
            {chatLoading ? (
              <p className="text-sm text-muted-foreground text-center py-8">Loading chat…</p>
            ) : chatMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                Ask: &quot;How do I log a catch?&quot; or &quot;Cold chain alerts&quot;
              </p>
            ) : (
              chatMessages.map((m, i) => (
                <div
                  key={`${m.timestamp}-${i}`}
                  className={`text-sm rounded-lg px-3 py-2 max-w-[90%] ${
                    m.role === 'user'
                      ? 'ml-auto bg-primary text-primary-foreground'
                      : 'bg-background border'
                  }`}
                >
                  {m.content}
                </div>
              ))
            )}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              sendMessage()
            }}
          >
            <Input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask about fishing ops, HR, auctions…"
              disabled={sending}
            />
            <Button type="submit" size="icon" disabled={sending || !chatInput.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Cold chain AI review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {coldReview ? (
              <>
                <p>{coldReview.summary}</p>
                <ul className="list-disc pl-4 text-muted-foreground">
                  {coldReview.recommendations.map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-muted-foreground">Run automation to generate.</p>
            )}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Inventory AI review</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            {inventoryReview ? (
              <>
                <p>{inventoryReview.summary}</p>
                <ul className="list-disc pl-4 text-muted-foreground">
                  {inventoryReview.recommendations.slice(0, 4).map((r, i) => (
                    <li key={i}>{r}</li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="text-muted-foreground">Run automation to generate.</p>
            )}
          </CardContent>
        </Card>
      </div>

      <DataTable
        title="Reorder recommendations"
        description="SKUs below 7 days of stock (statistical model)"
        loading={insightsLoading}
        data={inventoryRows}
        emptyMessage="Stock levels healthy or run automation after catalog movements exist"
        columns={[
          { key: 'productName', header: 'Product' },
          { key: 'sku', header: 'SKU', cell: (row) => <code className="text-xs">{row.sku}</code> },
          {
            key: 'daysOfStock',
            header: 'Days left',
            cell: (row) => (
              <Badge variant={row.urgency === 'critical' ? 'destructive' : 'secondary'}>
                {row.daysOfStock}d
              </Badge>
            ),
          },
          {
            key: 'reorderKg',
            header: 'Suggest reorder',
            cell: (row) => `${row.reorderKg} kg`,
          },
        ]}
      />
    </DashboardPageLayout>
  )
}

