'use client'

import { useState } from 'react'
import { DollarSign, TrendingUp, Users, Clock, AlertTriangle, Check, Filter } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useInvestmentPackages, createInvestment } from '@/lib/api'
import { useAppStore } from '@/lib/store'
import { toast } from 'sonner'
import type { InvestmentPackage } from '@/lib/types'

const typeLabels: Record<string, string> = {
  deep_sea: 'Deep Sea Fishing',
  lake_fishing: 'Lake Fishing',
  fish_transport: 'Fish Transport',
  cold_storage: 'Cold Storage',
  fish_trading: 'Fish Trading',
}

const riskColors: Record<string, string> = {
  low: 'bg-green-100 text-green-700 border-green-200',
  medium: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  high: 'bg-red-100 text-red-700 border-red-200',
}

export default function InvestmentsPage() {
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [selectedPackage, setSelectedPackage] = useState<InvestmentPackage | null>(null)
  const [investAmount, setInvestAmount] = useState('')
  const [isInvesting, setIsInvesting] = useState(false)
  
  const { currentUser } = useAppStore()
  const { data: packagesData, isLoading, mutate } = useInvestmentPackages(
    typeFilter !== 'all' ? typeFilter : undefined
  )

  const packages = packagesData?.data?.items || []

  const handleInvest = async () => {
    if (!selectedPackage || !currentUser) return

    setIsInvesting(true)
    try {
      const json = await createInvestment({
        investorId: currentUser.id,
        packageId: selectedPackage.id,
        amount: Number(investAmount),
      })
      if (!json.success) {
        toast.error(json.error || 'Investment failed')
        return
      }
      toast.success('Investment recorded')
      mutate()
      setSelectedPackage(null)
      setInvestAmount('')
    } catch (error) {
      console.error('Investment failed:', error)
      toast.error('Network error')
    }
    setIsInvesting(false)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investment Packages</h1>
          <p className="text-muted-foreground">
            Browse and invest in fishing operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-[180px]">
              <Filter className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="deep_sea">Deep Sea Fishing</SelectItem>
              <SelectItem value="lake_fishing">Lake Fishing</SelectItem>
              <SelectItem value="fish_transport">Fish Transport</SelectItem>
              <SelectItem value="cold_storage">Cold Storage</SelectItem>
              <SelectItem value="fish_trading">Fish Trading</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="open">
        <TabsList>
          <TabsTrigger value="open">Open for Investment</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value="open" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages
              .filter((pkg: InvestmentPackage) => pkg.status === 'open' || pkg.status === 'active')
              .map((pkg: InvestmentPackage) => (
                <PackageCard
                  key={pkg.id}
                  package={pkg}
                  onInvest={() => setSelectedPackage(pkg)}
                />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="active" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages
              .filter((pkg: InvestmentPackage) => pkg.status === 'active' || pkg.status === 'funded')
              .map((pkg: InvestmentPackage) => (
                <PackageCard key={pkg.id} package={pkg} />
              ))}
          </div>
        </TabsContent>

        <TabsContent value="completed" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {packages
              .filter((pkg: InvestmentPackage) => pkg.status === 'completed')
              .map((pkg: InvestmentPackage) => (
                <PackageCard key={pkg.id} package={pkg} />
              ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Investment Dialog */}
      <Dialog open={!!selectedPackage} onOpenChange={() => setSelectedPackage(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invest in {selectedPackage?.name}</DialogTitle>
            <DialogDescription>
              Enter the amount you wish to invest. Minimum: KES {selectedPackage?.minInvestment?.toLocaleString()}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Investment Amount (KES)</Label>
              <Input
                type="number"
                placeholder="Enter amount"
                value={investAmount}
                onChange={(e) => setInvestAmount(e.target.value)}
                min={selectedPackage?.minInvestment}
                max={(selectedPackage?.totalFunding || 0) - (selectedPackage?.currentFunding || 0)}
              />
            </div>
            {selectedPackage && (
              <div className="rounded-lg bg-muted p-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected ROI</span>
                  <span className="font-medium">{selectedPackage.expectedROI}%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Duration</span>
                  <span className="font-medium">{selectedPackage.duration} months</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Expected Return</span>
                  <span className="font-medium text-green-600">
                    KES {investAmount ? (Number(investAmount) * (1 + selectedPackage.expectedROI / 100)).toLocaleString() : '0'}
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedPackage(null)}>
              Cancel
            </Button>
            <Button
              onClick={handleInvest}
              disabled={
                isInvesting ||
                !investAmount ||
                Number(investAmount) < (selectedPackage?.minInvestment || 0)
              }
            >
              {isInvesting ? 'Processing...' : 'Confirm Investment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PackageCardProps {
  package: InvestmentPackage
  onInvest?: () => void
}

function PackageCard({ package: pkg, onInvest }: PackageCardProps) {
  const fundingProgress = (pkg.currentFunding / pkg.totalFunding) * 100
  const remainingFunding = pkg.totalFunding - pkg.currentFunding

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-start justify-between">
          <Badge variant="outline">{typeLabels[pkg.type]}</Badge>
          <Badge variant="outline" className={riskColors[pkg.riskLevel]}>
            {pkg.riskLevel} risk
          </Badge>
        </div>
        <CardTitle className="mt-2">{pkg.name}</CardTitle>
        <CardDescription className="line-clamp-2">{pkg.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Expected ROI</p>
            <p className="text-xl font-bold text-green-600">{pkg.expectedROI}%</p>
          </div>
          <div>
            <p className="text-muted-foreground">Duration</p>
            <p className="text-xl font-bold">{pkg.duration}mo</p>
          </div>
          <div>
            <p className="text-muted-foreground">Min Investment</p>
            <p className="font-semibold">KES {pkg.minInvestment.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Investors</p>
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4 text-muted-foreground" />
              <span className="font-semibold">{pkg.investors.length}</span>
            </div>
          </div>
        </div>

        <div className="mt-4 pt-4 border-t">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-muted-foreground">Funding Progress</span>
            <span className="font-medium">{fundingProgress.toFixed(0)}%</span>
          </div>
          <Progress value={fundingProgress} className="h-2" />
          <p className="text-xs text-muted-foreground mt-1">
            KES {pkg.currentFunding.toLocaleString()} of KES {pkg.totalFunding.toLocaleString()}
          </p>
        </div>

        {pkg.status === 'open' && onInvest && (
          <Button className="mt-4" onClick={onInvest}>
            <DollarSign className="mr-2 h-4 w-4" />
            Invest Now
          </Button>
        )}

        {pkg.status === 'funded' && (
          <Button className="mt-4" variant="secondary" disabled>
            <Check className="mr-2 h-4 w-4" />
            Fully Funded
          </Button>
        )}

        {pkg.status === 'active' && (
          <Button className="mt-4" variant="outline" disabled>
            <Clock className="mr-2 h-4 w-4" />
            In Progress
          </Button>
        )}

        {pkg.status === 'completed' && (
          <Button className="mt-4" variant="secondary" disabled>
            <Check className="mr-2 h-4 w-4" />
            Completed
          </Button>
        )}
      </CardContent>
    </Card>
  )
}
