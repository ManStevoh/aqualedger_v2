'use client'

import { TrendingUp, TrendingDown, DollarSign, Calendar, Clock, Target } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { useAppStore } from '@/lib/store'
import { useInvestments, useROIAnalysis, useInvestmentDistribution } from '@/lib/api'
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts'

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

export default function PortfolioPage() {
  const { currentUser } = useAppStore()
  const { data: investmentsData, isLoading } = useInvestments(currentUser?.id)
  const { data: roiData } = useROIAnalysis(currentUser?.id)
  const { data: distributionData } = useInvestmentDistribution()

  const investments = investmentsData?.data?.items || []
  const roiRecords = roiData?.data || []
  const distribution = distributionData?.data || []

  const totalInvested = investments.reduce((sum: number, inv: { amount: number }) => sum + inv.amount, 0)
  const totalExpectedReturn = investments.reduce((sum: number, inv: { expectedReturn: number }) => sum + inv.expectedReturn, 0)
  const totalDividends = investments.reduce((sum: number, inv: { dividendsPaid: number }) => sum + inv.dividendsPaid, 0)
  const activeCount = investments.filter((inv: { status: string }) => inv.status === 'active').length
  const avgROI = investments.length > 0
    ? investments.reduce((sum: number, inv: { dividendsPaid: number; amount: number }) => sum + (inv.dividendsPaid / inv.amount * 100), 0) / investments.length
    : 0

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investment Portfolio</h1>
          <p className="text-muted-foreground">
            Track your investments and returns
          </p>
        </div>
        <Button>
          <DollarSign className="mr-2 h-4 w-4" />
          New Investment
        </Button>
      </div>

      <StatCardGrid>
        <StatCard
          title="Total Invested"
          value={`KES ${totalInvested.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          description={`${activeCount} active investments`}
          loading={isLoading}
        />
        <StatCard
          title="Expected Returns"
          value={`KES ${totalExpectedReturn.toLocaleString()}`}
          icon={<Target className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: ((totalExpectedReturn - totalInvested) / totalInvested * 100), isPositive: true }}
          description="projected total"
          loading={isLoading}
        />
        <StatCard
          title="Dividends Earned"
          value={`KES ${totalDividends.toLocaleString()}`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 12.5, isPositive: true }}
          description="total received"
          loading={isLoading}
        />
        <StatCard
          title="Avg ROI"
          value={`${avgROI.toFixed(1)}%`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          description="across all investments"
          loading={isLoading}
        />
      </StatCardGrid>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Portfolio Distribution */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Portfolio Distribution</CardTitle>
            <CardDescription>Investment allocation by type</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={distribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {distribution.map((_entry: unknown, index: number) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `KES ${value.toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {distribution.map((item: { name: string; value: number }, index: number) => (
                <div key={item.name} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span>{item.name}</span>
                  </div>
                  <span className="font-medium">KES {(item.value / 1000000).toFixed(1)}M</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* ROI Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>ROI Performance</CardTitle>
            <CardDescription>Quarterly dividend performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={roiRecords}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="period" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${v / 1000}K`} />
                  <Tooltip
                    formatter={(value: number) => [`KES ${value.toLocaleString()}`, '']}
                    contentStyle={{ backgroundColor: 'hsl(var(--card))', border: '1px solid hsl(var(--border))' }}
                  />
                  <Legend />
                  <Bar dataKey="grossRevenue" name="Gross Revenue" fill="#0088FE" />
                  <Bar dataKey="dividendAmount" name="Your Dividend" fill="#00C49F" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Investments List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Investments</CardTitle>
          <CardDescription>All investment packages you have contributed to</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="active">
            <TabsList>
              <TabsTrigger value="active">Active</TabsTrigger>
              <TabsTrigger value="matured">Matured</TabsTrigger>
              <TabsTrigger value="all">All</TabsTrigger>
            </TabsList>
            <TabsContent value="active" className="mt-4 space-y-4">
              {investments
                .filter((inv: { status: string }) => inv.status === 'active')
                .map((inv: {
                  id: string
                  packageName: string
                  amount: number
                  expectedReturn: number
                  dividendsPaid: number
                  startDate: string
                  endDate: string
                  status: string
                }) => (
                  <InvestmentCard key={inv.id} investment={inv} />
                ))}
            </TabsContent>
            <TabsContent value="matured" className="mt-4 space-y-4">
              {investments
                .filter((inv: { status: string }) => inv.status === 'matured')
                .map((inv: {
                  id: string
                  packageName: string
                  amount: number
                  expectedReturn: number
                  dividendsPaid: number
                  actualReturn: number
                  startDate: string
                  endDate: string
                  status: string
                }) => (
                  <InvestmentCard key={inv.id} investment={inv} />
                ))}
            </TabsContent>
            <TabsContent value="all" className="mt-4 space-y-4">
              {investments.map((inv: {
                  id: string
                  packageName: string
                  amount: number
                  expectedReturn: number
                  dividendsPaid: number
                  actualReturn: number
                  startDate: string
                  endDate: string
                  status: string
                }) => (
                <InvestmentCard key={inv.id} investment={inv} />
              ))}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

interface InvestmentCardProps {
  investment: {
    id: string
    packageName: string
    amount: number
    expectedReturn: number
    dividendsPaid: number
    actualReturn?: number
    startDate: string
    endDate: string
    status: string
  }
}

function InvestmentCard({ investment }: InvestmentCardProps) {
  const progress = (investment.dividendsPaid / (investment.expectedReturn - investment.amount)) * 100
  const roi = (investment.dividendsPaid / investment.amount) * 100

  return (
    <div className="rounded-lg border p-4">
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-semibold">{investment.packageName}</h3>
          <p className="text-sm text-muted-foreground">
            Invested: KES {investment.amount.toLocaleString()}
          </p>
        </div>
        <Badge variant={investment.status === 'active' ? 'default' : 'secondary'}>
          {investment.status}
        </Badge>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <div>
          <p className="text-xs text-muted-foreground">Expected Return</p>
          <p className="font-semibold">KES {investment.expectedReturn.toLocaleString()}</p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Dividends Received</p>
          <p className="font-semibold text-green-600">
            +KES {investment.dividendsPaid.toLocaleString()}
          </p>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">Current ROI</p>
          <div className="flex items-center gap-1">
            {roi > 0 ? (
              <TrendingUp className="h-4 w-4 text-green-600" />
            ) : (
              <TrendingDown className="h-4 w-4 text-red-600" />
            )}
            <span className={roi > 0 ? 'text-green-600 font-semibold' : 'text-red-600 font-semibold'}>
              {roi.toFixed(1)}%
            </span>
          </div>
        </div>
        <div>
          <p className="text-xs text-muted-foreground">End Date</p>
          <div className="flex items-center gap-1 text-sm">
            <Calendar className="h-3 w-3" />
            <span>{new Date(investment.endDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      <div className="mt-4">
        <div className="flex justify-between text-xs mb-1">
          <span className="text-muted-foreground">Progress to expected return</span>
          <span>{Math.min(progress, 100).toFixed(0)}%</span>
        </div>
        <Progress value={Math.min(progress, 100)} className="h-2" />
      </div>
    </div>
  )
}
