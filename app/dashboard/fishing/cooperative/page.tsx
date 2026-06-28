'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useState, useEffect, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { StatCard } from '@/components/dashboard/stat-card'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { Coins, Users, Anchor, Download, RefreshCw, Percent, Calendar, Play } from 'lucide-react'

interface CoOpShare {
  id: string
  period_month: string
  member_user_id: string
  member_name?: string
  member_email?: string
  catch_kg: number
  revenue_share: number
  share_pct: number
  status: 'draft' | 'disbursed'
}

export default function CooperativeSharesPage() {
  const meta = useDashboardPageMeta({
    title: 'Cooperative revenue sharing',
    description: 'Distribute catch revenue to members by landed kg',
  })

  const [period, setPeriod] = useState(() => new Date().toISOString().slice(0, 7))
  const [shares, setShares] = useState<CoOpShare[]>([])
  const [loading, setLoading] = useState(false)
  const [calculating, setCalculating] = useState(false)
  const [disbursing, setDisbursing] = useState(false)

  const load = useCallback(async (currentPeriod = period) => {
    setLoading(true)
    try {
      const res = await authFetchJson<{ success: boolean; data?: { shares: CoOpShare[] } }>(
        `/api/v2/cooperative/revenue-shares?period=${currentPeriod}`,
      )
      if (res.success && res.data?.shares) {
        setShares(res.data.shares)
      } else {
        setShares([])
      }
    } catch {
      toast.error('Failed to load co-op shares data')
    } finally {
      setLoading(false)
    }
  }, [period])

  useEffect(() => {
    load()
  }, [load])

  const calculate = async () => {
    setCalculating(true)
    try {
      const res = await authFetchJson<{ success: boolean }>(
        '/api/v2/cooperative/revenue-shares',
        { method: 'POST', body: JSON.stringify({ periodMonth: period }) },
      )
      if (res.success) {
        toast.success('Shares calculated successfully')
        load()
      } else {
        toast.error('Failed to calculate shares')
      }
    } catch {
      toast.error('Failed to calculate shares')
    } finally {
      setCalculating(false)
    }
  }

  const disburse = async () => {
    if (shares.length === 0) {
      toast.error('No shares available to disburse')
      return
    }
    const isAlreadyDisbursed = shares.some(s => s.status === 'disbursed')
    if (isAlreadyDisbursed) {
      toast.info('Shares for this period have already been disbursed')
      return
    }

    setDisbursing(true)
    try {
      const res = await authFetchJson<{ success: boolean }>(
        '/api/v2/cooperative/revenue-shares',
        { method: 'PUT', body: JSON.stringify({ periodMonth: period }) },
      )
      if (res.success) {
        toast.success('Revenue shares disbursed successfully to all members')
        load()
      } else {
        toast.error('Failed to disburse shares')
      }
    } catch {
      toast.error('Failed to disburse shares')
    } finally {
      setDisbursing(false)
    }
  }

  const totalCatch = shares.reduce((sum, s) => sum + Number(s.catch_kg), 0)
  const totalRevenuePool = shares.reduce((sum, s) => sum + Number(s.revenue_share), 0)
  const activeMembers = shares.length
  const isPeriodDisbursed = shares.length > 0 && shares.every(s => s.status === 'disbursed')

  return (
    <DashboardPageLayout
      title={meta.title}
      description={meta.description}
      breadcrumbs={meta.breadcrumbs}
      actions={
        <div className="flex gap-2">
          <Button variant="outline" asChild disabled={shares.length === 0}>
            <a href={`/api/v2/analytics/export?type=kpi-summary&format=csv`} download>
              <Download className="mr-2 h-4 w-4" /> Export CSV
            </a>
          </Button>
          <Button
            onClick={disburse}
            disabled={disbursing || shares.length === 0 || isPeriodDisbursed}
            className={isPeriodDisbursed ? 'bg-green-600 hover:bg-green-700' : ''}
          >
            <Coins className="mr-2 h-4 w-4" />
            {isPeriodDisbursed ? 'Revenue Disbursed' : disbursing ? 'Disbursing...' : 'Disburse Payouts'}
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          title="Total Catch (KG)"
          value={`${totalCatch.toLocaleString(undefined, { maximumFractionDigits: 1 })} kg`}
          icon={<Anchor className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Total Revenue Distributed"
          value={`KES ${totalRevenuePool.toLocaleString(undefined, { maximumFractionDigits: 2 })}`}
          icon={<Coins className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Participating Members"
          value={activeMembers}
          icon={<Users className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Revenue Distribution Parameters</CardTitle>
          <CardDescription>Select a target period and recalculate the distribution matrix</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4 items-end">
          <div className="space-y-2 min-w-[200px]">
            <Label htmlFor="period-selector">Target Month</Label>
            <div className="relative">
              <Calendar className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="period-selector"
                type="month"
                className="pl-9"
                value={period}
                onChange={(e) => {
                  setPeriod(e.target.value)
                  load(e.target.value)
                }}
              />
            </div>
          </div>
          <Button onClick={calculate} disabled={calculating} className="gap-2">
            <Play className="h-4 w-4" />
            {calculating ? 'Calculating...' : 'Calculate Shares'}
          </Button>
          <Button variant="outline" onClick={() => load()} className="gap-2">
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Member Allocations</CardTitle>
          <CardDescription>Direct catch volume breakdown and cooperative payout split</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-muted-foreground">
                  <th className="text-left py-3 px-4 font-medium">Member Name</th>
                  <th className="text-left py-3 px-4 font-medium">Email Address</th>
                  <th className="text-right py-3 px-4 font-medium">Landed Catch</th>
                  <th className="text-right py-3 px-4 font-medium">Share Pct</th>
                  <th className="text-right py-3 px-4 font-medium">Net Payout</th>
                  <th className="text-center py-3 px-4 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {shares.map((s) => (
                  <tr key={s.id} className="border-b hover:bg-muted/50 transition-colors">
                    <td className="py-3 px-4 font-medium">
                      {s.member_name || `Member ${s.member_user_id.slice(0, 8)}`}
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">
                      {s.member_email || '—'}
                    </td>
                    <td className="py-3 px-4 text-right font-mono">
                      {Number(s.catch_kg).toLocaleString(undefined, { minimumFractionDigits: 1 })} kg
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-medium text-sky-600">
                      {Number(s.share_pct).toFixed(1)}%
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-slate-950">
                      KES {Number(s.revenue_share).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <Badge variant={s.status === 'disbursed' ? 'default' : 'secondary'}>
                        {s.status === 'disbursed' ? 'Disbursed' : 'Draft'}
                      </Badge>
                    </td>
                  </tr>
                ))}
                {shares.length === 0 && (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-muted-foreground">
                      {loading ? 'Loading shares data...' : 'No revenue shares calculated for this month. Choose a period and click Calculate Shares.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </DashboardPageLayout>
  )
}
