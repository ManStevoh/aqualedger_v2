'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/dashboard/stat-card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BookOpen, TrendingDown, TrendingUp, Wallet, Scale, Target, AlertTriangle, Coins } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'

interface LedgerSummary {
  accountCount: number
  entryCount: number
  totalDebits: number
  totalCredits: number
  revenue: number
  expenses: number
  netIncome: number
}

interface TrialBalanceRow {
  code: string
  name: string
  type: string
  balanceDebit: number
  balanceCredit: number
}

interface AccountLine {
  code: string
  name: string
  amount: number
}

interface TrialBalanceReport {
  rows: TrialBalanceRow[]
  totalDebits: number
  totalCredits: number
}

interface ProfitLossReport {
  revenue: AccountLine[]
  expenses: AccountLine[]
  totalRevenue: number
  totalExpenses: number
  netIncome: number
}

interface BalanceSheetReport {
  assets: AccountLine[]
  liabilities: AccountLine[]
  equity: AccountLine[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  netIncome: number
  totalLiabilitiesAndEquity: number
}

interface BudgetVsActualRow {
  accountCode: string
  accountName: string
  accountType: string
  budgetAmount: number
  actualAmount: number
  variance: number
  variancePct: number | null
}

interface BudgetVsActualReport {
  rows: BudgetVsActualRow[]
  totalBudget: number
  totalActual: number
  totalVariance: number
}

export default function AccountingReportsPage() {
  const [summary, setSummary] = useState<LedgerSummary | null>(null)
  const [trialBalance, setTrialBalance] = useState<TrialBalanceReport | null>(null)
  const [profitLoss, setProfitLoss] = useState<ProfitLossReport | null>(null)
  const [balanceSheet, setBalanceSheet] = useState<BalanceSheetReport | null>(null)
  const [budgetVsActual, setBudgetVsActual] = useState<BudgetVsActualReport | null>(null)
  const [cashFlow, setCashFlow] = useState<{
    operating: { label: string; amount: number }[]
    investing: { label: string; amount: number }[]
    financing: { label: string; amount: number }[]
    netCashChange: number
    standard: string
  } | null>(null)
  const [equity, setEquity] = useState<{
    openingEquity: number
    netIncome: number
    closingEquity: number
    movements: { label: string; amount: number }[]
    standard: string
  } | null>(null)
  const [fiscalYear, setFiscalYear] = useState(String(new Date().getFullYear()))
  const [loading, setLoading] = useState(true)
  const [reportLoading, setReportLoading] = useState(false)
  const [fxSnippet, setFxSnippet] = useState<string>('')

  useEffect(() => {
    fetchSummary()
    authFetchJson<{ success: boolean; data?: { rates: { quote_currency: string; rate: number }[] } }>(
      '/api/v2/accounting/currency?base=KES',
    )
      .then((res) => {
        if (res.success && res.data?.rates?.length) {
          const top = res.data.rates.slice(0, 3)
          setFxSnippet(
            top.map((r) => `1 KES ≈ ${Number(r.rate).toFixed(4)} ${r.quote_currency}`).join(' · '),
          )
        }
      })
      .catch(() => {})
  }, [])

  const fetchSummary = async () => {
    try {
      const data = await authFetchJson<{
        success: boolean
        data?: { summary: LedgerSummary }
      }>('/api/v2/accounting/ledger?resource=summary')
      if (data.success && data.data?.summary) {
        setSummary(data.data.summary)
      }
    } catch {
      toast.error('Failed to load financial summary')
    } finally {
      setLoading(false)
    }
  }

  const fetchReport = async (
    report: 'trial_balance' | 'profit_loss' | 'balance_sheet' | 'budget_vs_actual' | 'cash_flow' | 'equity',
  ) => {
    setReportLoading(true)
    try {
      const yearParam = report === 'budget_vs_actual' ? `&fiscalYear=${fiscalYear}` : ''
      const data = await authFetchJson<{
        success: boolean
        data?: {
          trialBalance?: TrialBalanceReport
          profitLoss?: ProfitLossReport
          balanceSheet?: BalanceSheetReport
          budgetVsActual?: BudgetVsActualReport
          cashFlow?: typeof cashFlow
          equity?: typeof equity
        }
      }>(`/api/v2/accounting/reports?report=${report}${yearParam}`)
      if (!data.success || !data.data) return
      if (report === 'trial_balance') setTrialBalance(data.data.trialBalance ?? null)
      if (report === 'profit_loss') setProfitLoss(data.data.profitLoss ?? null)
      if (report === 'balance_sheet') setBalanceSheet(data.data.balanceSheet ?? null)
      if (report === 'budget_vs_actual') setBudgetVsActual(data.data.budgetVsActual ?? null)
      if (report === 'cash_flow') setCashFlow(data.data.cashFlow ?? null)
      if (report === 'equity') setEquity(data.data.equity ?? null)
    } catch {
      toast.error('Failed to load IFRS report')
    } finally {
      setReportLoading(false)
    }
  }

  const handleTabChange = (tab: string) => {
    if (tab === 'trial_balance' && !trialBalance) fetchReport('trial_balance')
    if (tab === 'profit_loss' && !profitLoss) fetchReport('profit_loss')
    if (tab === 'balance_sheet' && !balanceSheet) fetchReport('balance_sheet')
    if (tab === 'budget') fetchReport('budget_vs_actual')
    if (tab === 'cash_flow' && !cashFlow) fetchReport('cash_flow')
    if (tab === 'equity' && !equity) fetchReport('equity')
  }

  const chartData = summary
    ? [
        { name: 'Revenue', amount: summary.revenue },
        { name: 'Expenses', amount: summary.expenses },
        { name: 'Net Income', amount: summary.netIncome },
      ]
    : []

  const fmt = (n: number) => `KES ${n.toLocaleString(undefined, { minimumFractionDigits: 2 })}`

  const renderAccountLines = (lines: AccountLine[]) => (
    <div className="space-y-2">
      {lines.map((line) => (
        <div key={line.code} className="flex justify-between text-sm border-b pb-1">
          <span>{line.code} — {line.name}</span>
          <span className="font-medium">{fmt(line.amount)}</span>
        </div>
      ))}
      {lines.length === 0 && (
        <p className="text-sm text-muted-foreground py-4">No balances in this section.</p>
      )}
    </div>
  )

  return (
    <DashboardPageLayout
      title="Financial Reports"
      description="IFRS-style reports derived from general ledger data"
    >
      {fxSnippet && (
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Coins className="h-4 w-4" />
              FX reference (KES base)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">{fxSnippet}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="summary" onValueChange={handleTabChange}>
        <TabsList className="flex-wrap">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="budget">Budget vs Actual</TabsTrigger>
          <TabsTrigger value="trial_balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="profit_loss">P&amp;L</TabsTrigger>
          <TabsTrigger value="balance_sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash_flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="equity">Changes in Equity</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Revenue vs Expenses</CardTitle>
                <CardDescription>Aggregated from posted journal lines by account type</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value) => `KES ${Number(value).toLocaleString()}`} />
                    <Bar dataKey="amount" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ledger Totals</CardTitle>
                <CardDescription>Debit/credit balance check</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" /> Total Debits
                    </span>
                    <span className="text-lg font-bold">
                      KES {(summary?.totalDebits ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium flex items-center gap-2">
                      <TrendingDown className="w-4 h-4" /> Total Credits
                    </span>
                    <span className="text-lg font-bold">
                      KES {(summary?.totalCredits ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <span className="font-medium">Operating Expenses</span>
                    <span className="text-lg font-bold text-red-600">
                      KES {(summary?.expenses ?? 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Balanced</span>
                    <span className="text-sm font-semibold">
                      {summary && Math.abs(summary.totalDebits - summary.totalCredits) < 0.01
                        ? 'Yes'
                        : 'Pending entries'}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="budget" className="mt-4 space-y-4">
          <div className="flex items-end gap-4">
            <div className="space-y-2">
              <Label>Fiscal year</Label>
              <Input
                type="number"
                className="w-32"
                value={fiscalYear}
                onChange={(e) => setFiscalYear(e.target.value)}
              />
            </div>
            <Button variant="outline" onClick={() => fetchReport('budget_vs_actual')} disabled={reportLoading}>
              Refresh
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <StatCard
              title="Total Budget"
              value={`KES ${(budgetVsActual?.totalBudget ?? 0).toLocaleString()}`}
              icon={<Target className="h-4 w-4 text-muted-foreground" />}
              loading={reportLoading && !budgetVsActual}
            />
            <StatCard
              title="Total Actual"
              value={`KES ${(budgetVsActual?.totalActual ?? 0).toLocaleString()}`}
              icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
              loading={reportLoading && !budgetVsActual}
            />
            <StatCard
              title="Variance"
              value={`KES ${(budgetVsActual?.totalVariance ?? 0).toLocaleString()}`}
              icon={<AlertTriangle className="h-4 w-4 text-muted-foreground" />}
              loading={reportLoading && !budgetVsActual}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Budget vs Actual by Account</CardTitle>
              <CardDescription>Compare annual budgets to posted GL activity for {fiscalYear}</CardDescription>
            </CardHeader>
            <CardContent>
              {reportLoading && !budgetVsActual ? (
                <p className="text-muted-foreground py-8 text-center">Loading budget report…</p>
              ) : (
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2 px-3">Code</th>
                      <th className="text-left py-2 px-3">Account</th>
                      <th className="text-left py-2 px-3">Type</th>
                      <th className="text-right py-2 px-3">Budget</th>
                      <th className="text-right py-2 px-3">Actual</th>
                      <th className="text-right py-2 px-3">Variance</th>
                      <th className="text-right py-2 px-3">%</th>
                    </tr>
                  </thead>
                  <tbody>
                    {budgetVsActual?.rows.map((row) => (
                      <tr key={row.accountCode} className="border-b hover:bg-muted/50">
                        <td className="py-2 px-3 font-mono">{row.accountCode}</td>
                        <td className="py-2 px-3">{row.accountName}</td>
                        <td className="py-2 px-3"><Badge variant="outline">{row.accountType}</Badge></td>
                        <td className="py-2 px-3 text-right">{fmt(row.budgetAmount)}</td>
                        <td className="py-2 px-3 text-right">{fmt(row.actualAmount)}</td>
                        <td className={`py-2 px-3 text-right ${row.variance < 0 ? 'text-red-600' : 'text-green-700'}`}>
                          {fmt(row.variance)}
                        </td>
                        <td className="py-2 px-3 text-right">
                          {row.variancePct !== null ? `${row.variancePct.toFixed(1)}%` : '—'}
                        </td>
                      </tr>
                    ))}
                    {(budgetVsActual?.rows.length ?? 0) === 0 && (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          No budgets defined for this fiscal year
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trial_balance" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Trial Balance</CardTitle>
              <CardDescription>IFRS trial balance from posted journal lines</CardDescription>
            </CardHeader>
            <CardContent>
              {reportLoading && !trialBalance ? (
                <p className="text-muted-foreground py-8 text-center">Loading report…</p>
              ) : (
                <>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Code</th>
                        <th className="text-left py-2 px-3">Account</th>
                        <th className="text-left py-2 px-3">Type</th>
                        <th className="text-right py-2 px-3">Debit</th>
                        <th className="text-right py-2 px-3">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trialBalance?.rows.map((row) => (
                        <tr key={row.code} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-3 font-mono">{row.code}</td>
                          <td className="py-2 px-3">{row.name}</td>
                          <td className="py-2 px-3"><Badge variant="outline">{row.type}</Badge></td>
                          <td className="py-2 px-3 text-right">
                            {row.balanceDebit > 0 ? fmt(row.balanceDebit) : '—'}
                          </td>
                          <td className="py-2 px-3 text-right">
                            {row.balanceCredit > 0 ? fmt(row.balanceCredit) : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-semibold border-t">
                        <td colSpan={3} className="py-2 px-3">Totals</td>
                        <td className="py-2 px-3 text-right">{fmt(trialBalance?.totalDebits ?? 0)}</td>
                        <td className="py-2 px-3 text-right">{fmt(trialBalance?.totalCredits ?? 0)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="profit_loss" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Profit &amp; Loss Statement</CardTitle>
                <CardDescription>Revenue and expense accounts (IFRS)</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {reportLoading && !profitLoss ? (
                  <p className="text-muted-foreground py-8 text-center">Loading report…</p>
                ) : (
                  <>
                    <div>
                      <h3 className="font-semibold mb-2 text-green-700">Revenue</h3>
                      {renderAccountLines(profitLoss?.revenue ?? [])}
                      <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                        <span>Total Revenue</span>
                        <span>{fmt(profitLoss?.totalRevenue ?? 0)}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2 text-red-700">Expenses</h3>
                      {renderAccountLines(profitLoss?.expenses ?? [])}
                      <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                        <span>Total Expenses</span>
                        <span>{fmt(profitLoss?.totalExpenses ?? 0)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg font-bold">
                      <span>Net Income</span>
                      <span>{fmt(profitLoss?.netIncome ?? 0)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="balance_sheet" className="mt-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Assets</CardTitle>
              </CardHeader>
              <CardContent>
                {reportLoading && !balanceSheet ? (
                  <p className="text-muted-foreground py-8 text-center">Loading report…</p>
                ) : (
                  <>
                    {renderAccountLines(balanceSheet?.assets ?? [])}
                    <div className="flex justify-between font-semibold mt-4 pt-2 border-t">
                      <span>Total Assets</span>
                      <span>{fmt(balanceSheet?.totalAssets ?? 0)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Liabilities &amp; Equity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {reportLoading && !balanceSheet ? (
                  <p className="text-muted-foreground py-8 text-center">Loading report…</p>
                ) : (
                  <>
                    <div>
                      <h3 className="font-semibold mb-2">Liabilities</h3>
                      {renderAccountLines(balanceSheet?.liabilities ?? [])}
                      <div className="flex justify-between font-medium mt-2">
                        <span>Total Liabilities</span>
                        <span>{fmt(balanceSheet?.totalLiabilities ?? 0)}</span>
                      </div>
                    </div>
                    <div>
                      <h3 className="font-semibold mb-2">Equity</h3>
                      {renderAccountLines(balanceSheet?.equity ?? [])}
                      <div className="flex justify-between font-medium mt-2">
                        <span>Total Equity</span>
                        <span>{fmt(balanceSheet?.totalEquity ?? 0)}</span>
                      </div>
                    </div>
                    <div className="flex justify-between p-3 bg-muted rounded-lg font-bold">
                      <span>Liabilities + Equity</span>
                      <span>{fmt(balanceSheet?.totalLiabilitiesAndEquity ?? 0)}</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="cash_flow" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Cash Flow Statement</CardTitle>
              <CardDescription>{cashFlow?.standard ?? 'IAS 7 indirect method (simplified)'}</CardDescription>
            </CardHeader>
            <CardContent>
              {reportLoading && !cashFlow ? (
                <p className="text-muted-foreground py-8 text-center">Loading…</p>
              ) : (
                <div className="space-y-6">
                  {(['operating', 'investing', 'financing'] as const).map((section) => (
                    <div key={section}>
                      <h3 className="font-semibold capitalize mb-2">{section}</h3>
                      {(cashFlow?.[section] ?? []).map((line) => (
                        <div key={line.label} className="flex justify-between text-sm border-b py-1">
                          <span>{line.label}</span>
                          <span>{fmt(line.amount)}</span>
                        </div>
                      ))}
                    </div>
                  ))}
                  <div className="flex justify-between font-bold pt-2 border-t">
                    <span>Net cash change</span>
                    <span>{fmt(cashFlow?.netCashChange ?? 0)}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="equity" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Statement of Changes in Equity</CardTitle>
              <CardDescription>{equity?.standard}</CardDescription>
            </CardHeader>
            <CardContent>
              {reportLoading && !equity ? (
                <p className="text-muted-foreground py-8 text-center">Loading…</p>
              ) : (
                <>
                  {(equity?.movements ?? []).map((m) => (
                    <div key={m.label} className="flex justify-between text-sm border-b py-2">
                      <span>{m.label}</span>
                      <span className="font-medium">{fmt(m.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between font-bold mt-4 pt-2 border-t">
                    <span>Closing equity</span>
                    <span>{fmt(equity?.closingEquity ?? 0)}</span>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </DashboardPageLayout>
  )
}