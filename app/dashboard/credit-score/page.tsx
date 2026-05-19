'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { StatCard } from '@/components/dashboard/stat-card'
import { TrendingUp, CreditCard, DollarSign, AlertCircle, CheckCircle2, Info } from 'lucide-react'
import { authFetchJson } from '@/lib/api'

interface CreditScoreFactors {
  catchConsistency: number
  incomeStability: number
  tripFrequency: number
  repaymentHistory: number
  assetOwnership: number
  bmuVerification: number
  yearsOfExperience: number
}

interface CreditScore {
  userId: string
  score: number
  rating: 'poor' | 'fair' | 'good' | 'very_good' | 'excellent'
  factors: CreditScoreFactors
  eligibleLoanAmount: number
  interestRate: number
  lastUpdated: string
  recommendations: string[]
}

export default function CreditScorePage() {
  const [creditData, setCreditData] = useState<CreditScore | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCreditScore()
  }, [])

  const fetchCreditScore = async () => {
    try {
      const result = await authFetchJson<{ success: boolean; data?: Record<string, unknown> }>(
        '/api/v2/credit-score',
      )
      if (result.success && result.data && result.data.score != null) {
        const row = result.data
        const score = Number(row.score) || 300
        const g = (row.grade as string) || 'E'
        const ratingMap: Record<string, CreditScore['rating']> = {
          A: 'excellent',
          B: 'very_good',
          C: 'good',
          D: 'fair',
          E: 'poor',
        }
        setCreditData({
          userId: ((row.user_id ?? row.userId) as string) || '',
          score,
          rating: ratingMap[g] || 'poor',
          factors: {
            catchConsistency: Number(row.fishing_activity_score) || 0,
            incomeStability: Number(row.income_stability_score) || 0,
            tripFrequency: Number(row.experience_score) || 0,
            repaymentHistory: Number(row.payment_history_score) || 0,
            assetOwnership: Number(row.compliance_score) || 0,
            bmuVerification: Number(row.compliance_score) || 0,
            yearsOfExperience: Math.min(20, Math.floor((score - 300) / 30)),
          },
          eligibleLoanAmount: Math.max(0, (score - 300) * 500),
          interestRate: Math.max(8, 24 - Math.floor((score - 300) / 50)),
          lastUpdated: row.last_calculated
            ? String(row.last_calculated)
            : new Date().toISOString().split('T')[0],
          recommendations: [
            'Keep trip and catch records up to date in AquaLedger.',
            'Maintain on-time wallet and marketplace payments.',
          ],
        })
      }
    } catch (error) {
      console.error('Failed to fetch credit score:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 750) return 'text-emerald-500'
    if (score >= 700) return 'text-green-500'
    if (score >= 650) return 'text-yellow-500'
    if (score >= 600) return 'text-orange-500'
    return 'text-red-500'
  }

  const getRatingBadge = (rating: string) => {
    const colors: Record<string, string> = {
      excellent: 'bg-emerald-100 text-emerald-800',
      very_good: 'bg-green-100 text-green-800',
      good: 'bg-yellow-100 text-yellow-800',
      fair: 'bg-orange-100 text-orange-800',
      poor: 'bg-red-100 text-red-800'
    }
    return colors[rating] || 'bg-muted text-muted-foreground'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
      </div>
    )
  }

  if (!creditData) {
    return (
      <Card className="max-w-lg mx-auto mt-8">
        <CardContent className="p-6 text-center">
          <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No Credit Score Available</h3>
          <p className="text-muted-foreground mb-4">
            Start recording your catches and fishing activity to build your credit score.
          </p>
          <Button>Start Recording Catches</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">AI Credit Score</h1>
        <p className="text-muted-foreground">
          Your credit score based on fishing activity, income patterns, and financial behavior
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Credit Score"
          value={creditData.score}
          icon={<CreditCard className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 15, isPositive: true }}
        />
        <StatCard
          title="Eligible Loan"
          value={`KES ${creditData.eligibleLoanAmount.toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 10, isPositive: true }}
        />
        <StatCard
          title="Interest Rate"
          value={`${creditData.interestRate}%`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 2, isPositive: false }}
        />
        <StatCard
          title="Experience"
          value={`${creditData.factors.yearsOfExperience} Years`}
          icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Main Score Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Credit Score</CardTitle>
            <CardDescription>Last updated: {creditData.lastUpdated}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <div className={`text-6xl font-bold ${getScoreColor(creditData.score)}`}>
                {creditData.score}
              </div>
              <Badge className={`mt-2 ${getRatingBadge(creditData.rating)}`}>
                {creditData.rating.replace('_', ' ').toUpperCase()}
              </Badge>
              <p className="text-sm text-muted-foreground mt-2">
                Score range: 300 - 850
              </p>
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Poor</span>
                <span>Fair</span>
                <span>Good</span>
                <span>Very Good</span>
                <span>Excellent</span>
              </div>
              <div className="h-3 rounded-full bg-gradient-to-r from-red-500 via-yellow-500 to-emerald-500 relative">
                <div 
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white border-2 border-foreground rounded-full shadow-lg"
                  style={{ left: `${((creditData.score - 300) / 550) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  KES {creditData.eligibleLoanAmount.toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Maximum Loan Amount</div>
              </div>
              <div className="text-center p-4 bg-muted/50 rounded-lg">
                <div className="text-2xl font-bold text-primary">
                  {creditData.interestRate}%
                </div>
                <div className="text-sm text-muted-foreground">Interest Rate</div>
              </div>
            </div>

            <Button className="w-full" size="lg">
              Apply for a Loan
            </Button>
          </CardContent>
        </Card>

        {/* Score Factors */}
        <Card>
          <CardHeader>
            <CardTitle>Score Factors</CardTitle>
            <CardDescription>
              These factors determine your credit score
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: 'Catch Consistency', value: creditData.factors.catchConsistency, weight: '25%' },
              { name: 'Income Stability', value: creditData.factors.incomeStability, weight: '20%' },
              { name: 'Trip Frequency', value: creditData.factors.tripFrequency, weight: '15%' },
              { name: 'Repayment History', value: creditData.factors.repaymentHistory, weight: '20%' },
              { name: 'Asset Ownership', value: creditData.factors.assetOwnership, weight: '10%' },
              { name: 'BMU Verification', value: creditData.factors.bmuVerification, weight: '10%' },
            ].map((factor) => (
              <div key={factor.name} className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{factor.name}</span>
                  <span className="text-muted-foreground">
                    {factor.value}% ({factor.weight})
                  </span>
                </div>
                <Progress value={factor.value} className="h-2" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      {/* Recommendations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Recommendations to Improve Your Score
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-3">
            {creditData.recommendations.map((rec, index) => (
              <div key={index} className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg">
                <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-sm">{rec}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* How It Works */}
      <Card>
        <CardHeader>
          <CardTitle>How AI Credit Scoring Works</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            {[
              { step: '1', title: 'Record Catches', desc: 'Log your daily catches via SMS, USSD, or WhatsApp' },
              { step: '2', title: 'Build History', desc: 'Consistent activity builds your fishing profile' },
              { step: '3', title: 'AI Analysis', desc: 'Our AI analyzes your patterns and calculates your score' },
              { step: '4', title: 'Access Credit', desc: 'Use your score to access loans from partner institutions' },
            ].map((item) => (
              <div key={item.step} className="text-center p-4">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-3 font-bold">
                  {item.step}
                </div>
                <h4 className="font-semibold mb-1">{item.title}</h4>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
