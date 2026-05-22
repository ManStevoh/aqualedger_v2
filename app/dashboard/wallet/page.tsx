'use client'

import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { Suspense, useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Minus, CreditCard, Smartphone, Coins } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { StatCard, StatCardGrid } from '@/components/dashboard/stat-card'
import { useAppStore } from '@/lib/store'
import { useWallet, useTransactions, walletTransaction, authFetchJson } from '@/lib/api'
import { toast } from 'sonner'
import { APP_NAME } from '@/lib/constants'
import type { Transaction } from '@/lib/types'

interface FxRate {
  quote_currency: string
  rate: number
  effective_date: string
}

function WalletPageContent() {
  const searchParams = useSearchParams()
  const showFx = searchParams.get('fx') === '1'
  const [fxRates, setFxRates] = useState<FxRate[]>([])
  const [fxLoading, setFxLoading] = useState(false)
  const [convertAmount, setConvertAmount] = useState('1000')
  const [convertTo, setConvertTo] = useState('USD')
  const [converted, setConverted] = useState<string | null>(null)

  const [showDepositDialog, setShowDepositDialog] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [mpesaPhone, setMpesaPhone] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const { currentUser } = useAppStore()
  const { data: walletData, isLoading, mutate: mutateWallet } = useWallet(currentUser?.id || '')
  const { data: transactionsData, mutate: mutateTransactions } = useTransactions(currentUser?.id || '')

  const wallet = walletData?.data
  const transactions = transactionsData?.data?.items || []

  const fetchFx = useCallback(async () => {
    setFxLoading(true)
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { rates: FxRate[] }
      }>('/api/v2/accounting/currency?base=KES')
      if (res.success && res.data?.rates) {
        const seen = new Set<string>()
        const unique = res.data.rates.filter((r) => {
          if (seen.has(r.quote_currency)) return false
          seen.add(r.quote_currency)
          return true
        })
        setFxRates(unique.slice(0, 6))
      }
    } catch {
      setFxRates([])
    } finally {
      setFxLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchFx()
  }, [fetchFx])

  const runConvert = async () => {
    const amt = Number(convertAmount)
    if (!amt || amt <= 0) return
    try {
      const res = await authFetchJson<{
        success: boolean
        data?: { conversion: { convertedAmount: number; toCurrency: string } }
      }>('/api/v2/accounting/currency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: amt, from: 'KES', to: convertTo }),
      })
      if (res.success && res.data?.conversion) {
        setConverted(
          `${res.data.conversion.convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${res.data.conversion.toCurrency}`,
        )
      }
    } catch {
      setConverted(null)
    }
  }

  const pollPaymentIntent = useCallback(async (intentId: string, attempts = 0): Promise<boolean> => {
    if (attempts > 24) return false
    const res = await authFetchJson<{
      success: boolean
      data?: { intent?: { status: string } }
    }>(`/api/v2/payments/mpesa?id=${encodeURIComponent(intentId)}`)
    if (res.success && res.data?.intent?.status === 'completed') return true
    if (res.data?.intent?.status === 'failed') return false
    await new Promise((r) => setTimeout(r, 2500))
    return pollPaymentIntent(intentId, attempts + 1)
  }, [])

  const handleTransaction = async (action: 'deposit' | 'withdraw') => {
    if (!currentUser || !amount) return

    setIsProcessing(true)
    try {
      if (action === 'deposit' && paymentMethod === 'mpesa') {
        const res = await authFetchJson<{
          success: boolean
          error?: string
          data?: { stk?: { paymentIntentId: string; simulated?: boolean }; pending?: boolean }
        }>('/api/v2/wallet', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'deposit',
            amount: Number(amount),
            paymentMethod: 'mpesa',
            phoneNumber: mpesaPhone.trim() || undefined,
            description: 'Wallet deposit via M-Pesa',
          }),
        })
        if (!res.success) {
          toast.error(res.error || 'M-Pesa request failed')
          return
        }
        const intentId = res.data?.stk?.paymentIntentId
        if (res.data?.stk?.simulated) {
          toast.success('M-Pesa deposit completed')
          mutateWallet()
          mutateTransactions()
          setShowDepositDialog(false)
          setAmount('')
          return
        }
        toast.message('Check your phone', {
          description: 'Approve the M-Pesa prompt to complete your deposit.',
        })
        if (intentId) {
          const ok = await pollPaymentIntent(intentId)
          if (ok) {
            toast.success('Deposit credited to wallet')
            mutateWallet()
            mutateTransactions()
            setShowDepositDialog(false)
            setAmount('')
          } else {
            toast.error('Payment not confirmed yet. Refresh wallet after approving on your phone.')
          }
        }
        return
      }

      const json = await walletTransaction({
        userId: currentUser.id,
        action,
        amount: Number(amount),
        description: `${action === 'deposit' ? 'Deposit' : 'Withdrawal'} via ${paymentMethod === 'mpesa' ? 'M-Pesa' : 'Bank Transfer'}`,
      })
      if (!json.success) {
        toast.error(json.error || 'Transaction failed')
        return
      }
      toast.success(action === 'deposit' ? 'Deposit recorded' : 'Withdrawal recorded')
      mutateWallet()
      mutateTransactions()
      setShowDepositDialog(false)
      setShowWithdrawDialog(false)
      setAmount('')
    } catch (error) {
      console.error('Transaction failed:', error)
      toast.error('Network error')
    }
    setIsProcessing(false)
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'deposit':
        return <ArrowDownLeft className="h-4 w-4 text-green-600" />
      case 'withdrawal':
        return <ArrowUpRight className="h-4 w-4 text-red-600" />
      case 'dividend':
        return <Plus className="h-4 w-4 text-green-600" />
      case 'investment':
        return <Minus className="h-4 w-4 text-blue-600" />
      default:
        return <Wallet className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getTransactionColor = (type: string, amount: number) => {
    if (amount > 0) return 'text-green-600'
    return 'text-red-600'
  }

  return (
    <DashboardPageLayout
      title="Wallet"
      description="Manage your funds and transactions"
    >
      <DashboardPageLayout
      title="Wallet"
      description="Manage your funds and transactions"
    >
      <div className="space-y-2">
              <Label>Payment Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      M-Pesa
                    </div>
                  </SelectItem>
                  <SelectItem value="bank">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            {paymentMethod === 'mpesa' && (
              <div className="space-y-2">
                <Label>M-Pesa phone (2547XXXXXXXX)</Label>
                <Input
                  type="tel"
                  placeholder={currentUser?.phone || '254700000000'}
                  value={mpesaPhone}
                  onChange={(e) => setMpesaPhone(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  STK push is sent to this number. Leave blank to use your profile phone.
                </p>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDepositDialog(false)}>
              Cancel
            </Button>
            <Button onClick={() => handleTransaction('deposit')} disabled={isProcessing || !amount}>
              {isProcessing ? 'Processing...' : 'Deposit'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Withdraw Dialog */}
      <Dialog open={showWithdrawDialog} onOpenChange={setShowWithdrawDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Withdraw Funds</DialogTitle>
            <DialogDescription>
              Transfer money from your wallet. Available: KES {(wallet?.balance || 0).toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Amount (KES)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={wallet?.balance}
              />
            </div>
            <div className="space-y-2">
              <Label>Withdrawal Method</Label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mpesa">
                    <div className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      M-Pesa
                    </div>
                  </SelectItem>
                  <SelectItem value="bank">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Bank Transfer
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowWithdrawDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => handleTransaction('withdraw')}
              disabled={isProcessing || !amount || Number(amount) > (wallet?.balance || 0)}
            >
              {isProcessing ? 'Processing...' : 'Withdraw'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default function WalletPage() {
  return (
    <Suspense fallback={<p className="text-sm text-muted-foreground p-6">Loading wallet…</p>}>
      <WalletPageContent />
    </Suspense>
  )
}

interface TransactionListProps {
  transactions: Transaction[]
  getIcon: (type: string) => React.ReactNode
  getColor: (type: string, amount: number) => string
}

function TransactionList({ transactions, getIcon, getColor }: TransactionListProps) {
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No transactions found
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {transactions.map((txn) => (
        <div key={txn.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-background">
              {getIcon(txn.type)}
            </div>
            <div>
              <p className="font-medium">{txn.description}</p>
              <p className="text-xs text-muted-foreground">
                {new Date(txn.createdAt).toLocaleString()}
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className={`font-semibold ${getColor(txn.type, txn.amount)}`}>
              {txn.amount > 0 ? '+' : ''}KES {Math.abs(txn.amount).toLocaleString()}
            </p>
            <Badge variant="outline" className="text-xs">
              {txn.status}
            </Badge>
          </div>
        </div>
      ))}
    </DashboardPageLayout>
  )
}
