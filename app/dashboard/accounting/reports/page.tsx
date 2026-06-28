'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { useDashboardPageMeta } from '@/lib/hooks/use-dashboard-page'
import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard } from '@/components/dashboard/stat-card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { BookOpen, TrendingDown, TrendingUp, Wallet, Scale, Target, AlertTriangle, Coins, Printer } from 'lucide-react'
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
  const meta = useDashboardPageMeta()

  const [activeTab, setActiveTab] = useState('summary')
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

  const activeTabName = {
    summary: 'Executive Financial Summary',
    budget: 'Budget vs Actual Statement',
    trial_balance: 'Trial Balance Statement',
    profit_loss: 'Profit & Loss Statement',
    balance_sheet: 'Balance Sheet Statement',
    cash_flow: 'Cash Flow Statement',
    equity: 'Statement of Changes in Equity',
  }[activeTab] || 'Financial Statement'

  const PrintHeader = () => (
    <div className="hidden print:block mb-8 border-b-2 border-slate-900 pb-4">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 uppercase tracking-tight">AquaERP Statement</h1>
          <p className="text-xs text-slate-500 mt-1">IFRS Compliant Financial Reporting System</p>
        </div>
        <div className="text-right">
          <h2 className="text-lg font-bold text-slate-800">{activeTabName}</h2>
          <p className="text-xs text-slate-500 mt-1">Fiscal Period: {fiscalYear}</p>
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-slate-400 mt-4">
        <span>Report Generated: {new Date().toLocaleString()}</span>
        <span>Status: Official Audited Data</span>
      </div>
    </div>
  )

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
      title={meta.title}
      description={meta.description}
      breadcrumbs={meta.breadcrumbs}
      actions={
        <Button variant="outline" onClick={() => window.print()} className="gap-2">
          <Printer className="w-4 h-4" />
          Print Statement
        </Button>
      }
    >
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="GL Accounts"
          value={summary?.accountCount ?? 0}
          icon={<BookOpen className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Posted Entries"
          value={summary?.entryCount ?? 0}
          icon={<Scale className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Total Revenue"
          value={`KES ${(summary?.revenue ?? 0).toLocaleString()}`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
        <StatCard
          title="Net Income"
          value={`KES ${(summary?.netIncome ?? 0).toLocaleString()}`}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          loading={loading}
        />
      </div>

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

      <Tabs value={activeTab} onValueChange={(tab) => {
        setActiveTab(tab)
        handleTabChange(tab)
      }}>
        <TabsList className="flex-wrap print:hidden">
          <TabsTrigger value="summary">Summary</TabsTrigger>
          <TabsTrigger value="budget">Budget vs Actual</TabsTrigger>
          <TabsTrigger value="trial_balance">Trial Balance</TabsTrigger>
          <TabsTrigger value="profit_loss">P&amp;L</TabsTrigger>
          <TabsTrigger value="balance_sheet">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cash_flow">Cash Flow</TabsTrigger>
          <TabsTrigger value="equity">Changes in Equity</TabsTrigger>
        </TabsList>

        <TabsContent value="summary" className="mt-4">
          <div className="print-section">
            <PrintHeader />
            
            {/* Simple printable table for Summary tab when printing */}
            <div className="hidden print:block mb-6">
              <h2 className="text-lg font-bold mb-4">Executive Financial Summary Indicators</h2>
              <table className="w-full text-sm border-collapse border border-slate-200">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="border border-slate-200 px-4 py-2 text-left">Indicator</th>
                    <th className="border border-slate-200 px-4 py-2 text-right">Value</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="border border-slate-200 px-4 py-2">Total Posted GL Accounts</td>
                    <td className="border border-slate-200 px-4 py-2 text-right font-mono">{summary?.accountCount ?? 0}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-4 py-2">Total Posted Journal Entries</td>
                    <td className="border border-slate-200 px-4 py-2 text-right font-mono">{summary?.entryCount ?? 0}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-4 py-2">Total Debits / Credits</td>
                    <td className="border border-slate-200 px-4 py-2 text-right font-mono">{fmt(summary?.totalDebits ?? 0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-4 py-2">Total Revenue</td>
                    <td className="border border-slate-200 px-4 py-2 text-right font-mono">{fmt(summary?.revenue ?? 0)}</td>
                  </tr>
                  <tr>
                    <td className="border border-slate-200 px-4 py-2">Operating Expenses</td>
                    <td className="border border-slate-200 px-4 py-2 text-right font-mono">{fmt(summary?.expenses ?? 0)}</td>
                  </tr>
                  <tr className="font-bold bg-slate-50">
                    <td className="border border-slate-200 px-4 py-2">Net Income</td>
                    <td className="border border-slate-200 px-4 py-2 text-right font-mono text-green-700">{fmt(summary?.netIncome ?? 0)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="grid gap-4 md:grid-cols-2 print:hidden">
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
          </div>
        </TabsContent>

        <TabsContent value="budget" className="mt-4 space-y-4">
          <div className="flex items-end gap-4 print:hidden">
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

          <div className="print-section space-y-4">
            <PrintHeader />
            <div className="grid gap-4 md:grid-cols-3 print:grid-cols-3">
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
              <CardHeader className="print:pb-2">
                <CardTitle>Budget vs Actual by Account</CardTitle>
                <CardDescription>Compare annual budgets to posted GL activity for {fiscalYear}</CardDescription>
              </CardHeader>
              <CardContent>
                {reportLoading && !budgetVsActual ? (
                  <p className="text-muted-foreground py-8 text-center print:hidden">Loading budget report…</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Code</th>
                        <th className="text-left py-2 px-3">Account</th>
                        <th className="text-left py-2 px-3 print:hidden">Type</th>
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
                          <td className="py-2 px-3 print:hidden"><Badge variant="outline">{row.accountType}</Badge></td>
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
          </div>
        </TabsContent>

        <TabsContent value="trial_balance" className="mt-4">
          <div className="print-section">
            <PrintHeader />
            <Card>
              <CardHeader className="print:pb-2">
                <CardTitle>Trial Balance</CardTitle>
                <CardDescription>IFRS trial balance from posted journal lines</CardDescription>
              </CardHeader>
              <CardContent>
                {reportLoading && !trialBalance ? (
                  <p className="text-muted-foreground py-8 text-center print:hidden">Loading report…</p>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3">Code</th>
                        <th className="text-left py-2 px-3">Account</th>
                        <th className="text-left py-2 px-3 print:hidden">Type</th>
                        <th className="text-right py-2 px-3">Debit</th>
                        <th className="text-right py-2 px-3">Credit</th>
                      </tr>
                    </thead>
                    <tbody>
                      {trialBalance?.rows.map((row) => (
                        <tr key={row.code} className="border-b hover:bg-muted/50">
                          <td className="py-2 px-3 font-mono">{row.code}</td>
                          <td className="py-2 px-3">{row.name}</td>
                          <td className="py-2 px-3 print:hidden"><Badge variant="outline">{row.type}</Badge></td>
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
                        <td colSpan={3} className="py-2 px-3 print:hidden">Totals</td>
                        <td colSpan={2} className="py-2 px-3 hidden print:table-cell">Totals</td>
                        <td className="py-2 px-3 text-right">{fmt(trialBalance?.totalDebits ?? 0)}</td>
                        <td className="py-2 px-3 text-right">{fmt(trialBalance?.totalCredits ?? 0)}</td>
                      </tr>
                    </tfoot>
                  </table>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="profit_loss" className="mt-4">
          <div className="print-section">
            <PrintHeader />
            <div className="grid gap-4 md:grid-cols-2 print:grid-cols-1">
              <Card className="w-full max-w-4xl mx-auto">
                <CardHeader className="print:pb-2">
                  <CardTitle>Profit &amp; Loss Statement</CardTitle>
                  <CardDescription>Revenue and expense accounts (IFRS)</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {reportLoading && !profitLoss ? (
                    <p className="text-muted-foreground py-8 text-center print:hidden">Loading report…</p>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-semibold mb-2 text-green-700 border-b pb-1">Revenue</h3>
                        {renderAccountLines(profitLoss?.revenue ?? [])}
                        <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                          <span>Total Revenue</span>
                          <span>{fmt(profitLoss?.totalRevenue ?? 0)}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 text-red-700 border-b pb-1">Expenses</h3>
                        {renderAccountLines(profitLoss?.expenses ?? [])}
                        <div className="flex justify-between font-semibold mt-2 pt-2 border-t">
                          <span>Total Expenses</span>
                          <span>{fmt(profitLoss?.totalExpenses ?? 0)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded-lg font-bold print:bg-slate-100">
                        <span>Net Income</span>
                        <span>{fmt(profitLoss?.netIncome ?? 0)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="balance_sheet" className="mt-4">
          <div className="print-section">
            <PrintHeader />
            <div className="grid gap-4 md:grid-cols-2 print:grid-cols-1">
              <Card>
                <CardHeader className="print:pb-2">
                  <CardTitle>Assets</CardTitle>
                </CardHeader>
                <CardContent>
                  {reportLoading && !balanceSheet ? (
                    <p className="text-muted-foreground py-8 text-center print:hidden">Loading report…</p>
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
                <CardHeader className="print:pb-2">
                  <CardTitle>Liabilities &amp; Equity</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {reportLoading && !balanceSheet ? (
                    <p className="text-muted-foreground py-8 text-center print:hidden">Loading report…</p>
                  ) : (
                    <>
                      <div>
                        <h3 className="font-semibold mb-2 border-b pb-1">Liabilities</h3>
                        {renderAccountLines(balanceSheet?.liabilities ?? [])}
                        <div className="flex justify-between font-medium mt-2">
                          <span>Total Liabilities</span>
                          <span>{fmt(balanceSheet?.totalLiabilities ?? 0)}</span>
                        </div>
                      </div>
                      <div>
                        <h3 className="font-semibold mb-2 border-b pb-1">Equity</h3>
                        {renderAccountLines(balanceSheet?.equity ?? [])}
                        <div className="flex justify-between font-medium mt-2">
                          <span>Total Equity</span>
                          <span>{fmt(balanceSheet?.totalEquity ?? 0)}</span>
                        </div>
                      </div>
                      <div className="flex justify-between p-3 bg-muted rounded-lg font-bold print:bg-slate-100">
                        <span>Liabilities + Equity</span>
                        <span>{fmt(balanceSheet?.totalLiabilitiesAndEquity ?? 0)}</span>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="cash_flow" className="mt-4">
          <div className="print-section">
            <PrintHeader />
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="print:pb-2">
                <CardTitle>Cash Flow Statement</CardTitle>
                <CardDescription>{cashFlow?.standard ?? 'IAS 7 indirect method (simplified)'}</CardDescription>
              </CardHeader>
              <CardContent>
                {reportLoading && !cashFlow ? (
                  <p className="text-muted-foreground py-8 text-center print:hidden">Loading…</p>
                ) : (
                  <div className="space-y-6">
                    {(['operating', 'investing', 'financing'] as const).map((section) => (
                      <div key={section}>
                        <h3 className="font-semibold capitalize mb-2 border-b pb-1">{section}</h3>
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
          </div>
        </TabsContent>

        <TabsContent value="equity" className="mt-4">
          <div className="print-section">
            <PrintHeader />
            <Card className="max-w-4xl mx-auto">
              <CardHeader className="print:pb-2">
                <CardTitle>Statement of Changes in Equity</CardTitle>
                <CardDescription>{equity?.standard}</CardDescription>
              </CardHeader>
              <CardContent>
                {reportLoading && !equity ? (
                  <p className="text-muted-foreground py-8 text-center print:hidden">Loading…</p>
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
          </div>
        </TabsContent>
      </Tabs>

      <style dangerouslySetInnerHTML={{
        __html: `
          @media print {
            body {
              background: white !important;
              color: black !important;
            }
            body * {
              visibility: hidden !important;
            }
            .print-section, .print-section * {
              visibility: visible !important;
            }
            .print-section {
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              margin: 0 !important;
              padding: 0 !important;
              background: white !important;
              color: black !important;
            }
            .print-section .rounded-xl,
            .print-section .border,
            .print-section .bg-card,
            .print-section .shadow-sm {
              border: none !important;
              box-shadow: none !important;
              background: transparent !important;
            }
            .print-section table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin-top: 1rem !important;
            }
            .print-section th, 
            .print-section td {
              border-bottom: 1px solid #cbd5e1 !important;
              padding: 8px 12px !important;
              color: black !important;
            }
            .print-section th {
              font-weight: bold !important;
              border-top: 2px solid #000000 !important;
              border-bottom: 2px solid #000000 !important;
              background-color: #f8fafc !important;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            .print-section tfoot tr {
              font-weight: bold !important;
              border-top: 2px solid #000000 !important;
              border-bottom: 2px solid #000000 !important;
            }
            .print-section .grid {
              display: flex !important;
              flex-direction: column !important;
              gap: 2rem !important;
            }
            .print-section tr,
            .print-section .space-y-6 > div {
              page-break-inside: avoid !important;
            }
          }
        `
      }} />
    </DashboardPageLayout>
  )
}

