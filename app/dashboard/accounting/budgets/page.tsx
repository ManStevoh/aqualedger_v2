'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { Target } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface Budget {
  id: string
  fiscal_year: number
  period: string
  amount: number
  account_code?: string
  account_name?: string
}

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [loading, setLoading] = useState(true)
  const year = new Date().getFullYear()

  useEffect(() => {
    authFetchJson<{ success: boolean; data?: { budgets: Budget[] } }>(
      `/api/v2/accounting/budgets?fiscalYear=${year}&limit=100`,
    )
      .then((res) => {
        if (res.success && res.data?.budgets) setBudgets(res.data.budgets)
      })
      .catch(() => toast.error('Failed to load budgets'))
      .finally(() => setLoading(false))
  }, [year])

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Target className="h-8 w-8" />
            Budgets
          </h1>
          <p className="text-muted-foreground">Fiscal year {year} budget lines by GL account</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/dashboard/accounting/reports">Budget vs Actual report</Link>
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Budget entries</CardTitle></CardHeader>
        <CardContent>
          {loading && <p className="text-muted-foreground">Loading…</p>}
          {budgets.map((b) => (
            <div key={b.id} className="flex justify-between border-b py-3 text-sm">
              <span>{b.account_code ?? '—'} {b.account_name ?? ''}</span>
              <Badge variant="outline">{b.period}</Badge>
              <span className="font-medium">KES {Number(b.amount).toLocaleString()}</span>
            </div>
          ))}
          {!loading && budgets.length === 0 && (
            <p className="text-muted-foreground py-4">No budgets — POST via API with accountId and fiscalYear</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
