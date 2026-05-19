'use client'

import { useState } from 'react'
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Minus, CreditCard, Smartphone } from 'lucide-react'
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
import { useWallet, useTransactions, walletTransaction } from '@/lib/api'
import { toast } from 'sonner'
import type { Transaction } from '@/lib/types'

export default function WalletPage() {
  const [showDepositDialog, setShowDepositDialog] = useState(false)
  const [showWithdrawDialog, setShowWithdrawDialog] = useState(false)
  const [amount, setAmount] = useState('')
  const [paymentMethod, setPaymentMethod] = useState('mpesa')
  const [isProcessing, setIsProcessing] = useState(false)

  const { currentUser } = useAppStore()
  const { data: walletData, isLoading, mutate: mutateWallet } = useWallet(currentUser?.id || '')
  const { data: transactionsData, mutate: mutateTransactions } = useTransactions(currentUser?.id || '')

  const wallet = walletData?.data
  const transactions = transactionsData?.data?.items || []

  const handleTransaction = async (action: 'deposit' | 'withdraw') => {
    if (!currentUser || !amount) return

    setIsProcessing(true)
    try {
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
              Add money to your AquaLedger wallet
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
              <div className="rounded-lg bg-muted p-3 text-sm">
                <p className="font-medium">M-Pesa Instructions:</p>
                <p className="text-muted-foreground mt-1">
                  A payment request will be sent to your registered phone number.
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
