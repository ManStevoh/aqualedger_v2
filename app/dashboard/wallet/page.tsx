'use client'

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
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Wallet</h1>
          <p className="text-muted-foreground">
            Manage your funds and transactions
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setShowWithdrawDialog(true)}>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Withdraw
          </Button>
          <Button onClick={() => setShowDepositDialog(true)}>
            <Plus className="mr-2 h-4 w-4" />
            Deposit
          </Button>
        </div>
      </div>

      <StatCardGrid>
        <StatCard
          title="Available Balance"
          value={`KES ${(wallet?.balance || 0).toLocaleString()}`}
          icon={<Wallet className="h-4 w-4 text-muted-foreground" />}
          description="Ready for investment"
          loading={isLoading}
        />
        <StatCard
          title="Total Deposits"
          value={`KES ${(wallet?.totalDeposits || 0).toLocaleString()}`}
          icon={<ArrowDownLeft className="h-4 w-4 text-muted-foreground" />}
          description="All-time deposits"
          loading={isLoading}
        />
        <StatCard
          title="Total Withdrawals"
          value={`KES ${(wallet?.totalWithdrawals || 0).toLocaleString()}`}
          icon={<ArrowUpRight className="h-4 w-4 text-muted-foreground" />}
          description="All-time withdrawals"
          loading={isLoading}
        />
        <StatCard
          title="Total Earnings"
          value={`KES ${(wallet?.totalEarnings || 0).toLocaleString()}`}
          icon={<Plus className="h-4 w-4 text-muted-foreground" />}
          trend={{ value: 12.5, isPositive: true }}
          description="Dividends received"
          loading={isLoading}
        />
      </StatCardGrid>

      {(showFx || fxRates.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              FX rates (base KES)
            </CardTitle>
            <CardDescription>
              Multi-currency reference from `currency_rates`. Wallet balance remains in KES.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {fxLoading ? (
              <p className="text-sm text-muted-foreground">Loading rates…</p>
            ) : fxRates.length === 0 ? (
              <p className="text-sm text-muted-foreground">No rates configured for this tenant.</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {fxRates.map((r) => (
                  <Badge key={r.quote_currency} variant="secondary" className="text-sm py-1 px-3">
                    1 KES ≈ {Number(r.rate).toFixed(4)} {r.quote_currency}
                    <span className="text-muted-foreground ml-1 text-xs">
                      ({r.effective_date})
                    </span>
                  </Badge>
                ))}
              </div>
            )}
            {wallet?.balance != null && fxRates.length > 0 && (
              <p className="text-sm text-muted-foreground">
                Approx. balance:{' '}
                {fxRates
                  .slice(0, 3)
                  .map(
                    (r) =>
                      `${(Number(wallet.balance) * Number(r.rate)).toLocaleString(undefined, { maximumFractionDigits: 0 })} ${r.quote_currency}`,
                  )
                  .join(' · ')}
              </p>
            )}
            <div className="flex flex-wrap items-end gap-3 pt-2 border-t">
              <div className="space-y-1">
                <Label className="text-xs">Convert KES</Label>
                <Input
                  type="number"
                  className="w-28"
                  value={convertAmount}
                  onChange={(e) => setConvertAmount(e.target.value)}
                />
              </div>
              <Select value={convertTo} onValueChange={setConvertTo}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {['USD', 'EUR', 'TZS', 'GBP'].map((c) => (
                    <SelectItem key={c} value={c}>
                      {c}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button variant="outline" size="sm" onClick={runConvert}>
                Convert
              </Button>
              {converted && (
                <span className="text-sm font-medium text-primary">≈ {converted}</span>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <CardTitle>Transaction History</CardTitle>
          <CardDescription>Your recent wallet transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="deposits">Deposits</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals</TabsTrigger>
              <TabsTrigger value="dividends">Dividends</TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="mt-4">
              <TransactionList transactions={transactions} getIcon={getTransactionIcon} getColor={getTransactionColor} />
            </TabsContent>
            <TabsContent value="deposits" className="mt-4">
              <TransactionList
                transactions={transactions.filter((t: Transaction) => t.type === 'deposit')}
                getIcon={getTransactionIcon}
                getColor={getTransactionColor}
              />
            </TabsContent>
            <TabsContent value="withdrawals" className="mt-4">
              <TransactionList
                transactions={transactions.filter((t: Transaction) => t.type === 'withdrawal')}
                getIcon={getTransactionIcon}
                getColor={getTransactionColor}
              />
            </TabsContent>
            <TabsContent value="dividends" className="mt-4">
              <TransactionList
                transactions={transactions.filter((t: Transaction) => t.type === 'dividend')}
                getIcon={getTransactionIcon}
                getColor={getTransactionColor}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Deposit Dialog */}
      <Dialog open={showDepositDialog} onOpenChange={setShowDepositDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Deposit Funds</DialogTitle>
            <DialogDescription>
              Add money to your {APP_NAME} wallet
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
              />
            </div>
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
    </div>
  )
}
