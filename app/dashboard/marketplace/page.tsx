'use client'

import { useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { StatCard } from '@/components/dashboard/stat-card'
import { TrendingUp, ShoppingCart, DollarSign, Filter, Plus, CheckCircle2 } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useAppStore } from '@/lib/store'
import { useFishListings, createListing, placeOrder, useFishSpecies } from '@/lib/api'
import type { FishListing } from '@/lib/types'
import { toast } from 'sonner'

export default function MarketplacePage() {
  const { currentUser } = useAppStore()
  const [searchTerm, setSearchTerm] = useState('')
  const [showListDialog, setShowListDialog] = useState(false)
  const [showBuyDialog, setShowBuyDialog] = useState(false)
  const [selectedListing, setSelectedListing] = useState<FishListing | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const [listFishType, setListFishType] = useState('')
  const [listQty, setListQty] = useState('')
  const [listGrade, setListGrade] = useState('export')
  const [listPrice, setListPrice] = useState('')
  const [listLocation, setListLocation] = useState('')

  const [buyQty, setBuyQty] = useState('')
  const [buyAddress, setBuyAddress] = useState('')

  const { data: listingsData, isLoading, mutate } = useFishListings('available', '200')
  const { data: speciesList = [] } = useFishSpecies()

  const items = listingsData?.data?.items || []

  const listingTrend = useMemo(() => {
    const byDay = new Map<string, { kg: number; count: number; priceSum: number }>()
    for (const it of items) {
      const d = (it.createdAt || '').split('T')[0]
      if (!d || d.length < 8) continue
      const cur = byDay.get(d) || { kg: 0, count: 0, priceSum: 0 }
      cur.kg += it.availableQuantity || 0
      cur.count += 1
      cur.priceSum += it.pricePerKg || 0
      byDay.set(d, cur)
    }
    return [...byDay.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-14)
      .map(([date, v]) => ({
        name: date.slice(5),
        kg: Math.round(v.kg),
        avgPrice: v.count ? Math.round(v.priceSum / v.count) : 0,
      }))
  }, [items])

  const filteredItems = items.filter(
    (item) =>
      !searchTerm.trim() ||
      item.fishType.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sellerName.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const totalListings = items.length
  const soldItems = items.filter((i) => i.status === 'sold').length
  const totalValue = items.reduce((sum, item) => sum + item.availableQuantity * item.pricePerKg, 0)
  const avgPrice = totalListings > 0 ? totalValue / totalListings : 0

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800'
      case 'sold':
        return 'bg-blue-100 text-blue-800'
      case 'reserved':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const handleCreateListing = async () => {
    if (!currentUser) {
      toast.error('Sign in required')
      return
    }
    if (!listFishType.trim() || !listQty || !listPrice) {
      toast.error('Fish type, quantity, and price are required')
      return
    }
    setSubmitting(true)
    try {
      const json = await createListing({
        sellerId: currentUser.id,
        sellerName: currentUser.name,
        fishType: listFishType.trim(),
        quantity: Number(listQty),
        grade: listGrade,
        pricePerKg: Number(listPrice),
        location: listLocation || 'Kenya',
        landingSite: listLocation || '',
      })
      if (!json.success) {
        toast.error(json.error || 'Could not create listing')
        return
      }
      toast.success('Listing published')
      setShowListDialog(false)
      setListFishType('')
      setListQty('')
      setListPrice('')
      setListLocation('')
      await mutate()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  const openBuy = (item: FishListing) => {
    setSelectedListing(item)
    setBuyQty(String(Math.min(item.availableQuantity, 10)))
    setBuyAddress('')
    setShowBuyDialog(true)
  }

  const handlePlaceOrder = async () => {
    if (!currentUser || !selectedListing) return
    const qty = Number(buyQty)
    if (!qty || qty < 1 || qty > selectedListing.availableQuantity) {
      toast.error('Invalid quantity')
      return
    }
    if (!buyAddress.trim()) {
      toast.error('Delivery address required')
      return
    }
    setSubmitting(true)
    try {
      const json = await placeOrder({
        listingId: selectedListing.id,
        buyerId: currentUser.id,
        buyerName: currentUser.name,
        quantity: qty,
        deliveryAddress: buyAddress.trim(),
      })
      if (!json.success) {
        toast.error(json.error || 'Order failed')
        return
      }
      toast.success('Order placed')
      setShowBuyDialog(false)
      setSelectedListing(null)
      await mutate()
    } catch {
      toast.error('Network error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Fish Marketplace</h1>
          <p className="text-muted-foreground">Buy and sell fish — listings from the database</p>
        </div>
        <Button
          className="gap-2"
          onClick={() => setShowListDialog(true)}
          disabled={
            !currentUser ||
            !['boat_owner', 'fisherman', 'super_admin', 'investor'].includes(currentUser.role)
          }
        >
          <Plus className="w-4 h-4" />
          List catch
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <StatCard
          title="Active listings"
          value={totalListings}
          icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Sold / reserved (page)"
          value={soldItems}
          icon={<CheckCircle2 className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Stock value (est.)"
          value={`KES ${Math.round(totalValue).toLocaleString()}`}
          icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <StatCard
          title="Avg list value"
          value={`KES ${avgPrice.toFixed(0)}`}
          icon={<TrendingUp className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Listed stock by day</CardTitle>
            <CardDescription>Sum of available kg on listings created each day (last 14 days with data)</CardDescription>
          </CardHeader>
          <CardContent>
            {listingTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No listing dates to chart yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={listingTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => [`${v.toLocaleString()} kg`, 'Available']} />
                  <Bar dataKey="kg" fill="#3b82f6" name="kg listed" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Average list price / kg</CardTitle>
            <CardDescription>Mean asking price for new listings that day</CardDescription>
          </CardHeader>
          <CardContent>
            {listingTrend.length === 0 ? (
              <p className="text-sm text-muted-foreground py-12 text-center">No listing dates to chart yet</p>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={listingTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip formatter={(v: number) => [`KES ${v.toLocaleString()}`, 'Avg / kg']} />
                  <Line type="monotone" dataKey="avgPrice" stroke="#8b5cf6" strokeWidth={2} name="KES/kg" />
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active listings</CardTitle>
          <CardDescription>Available fish from `fish_listings`</CardDescription>
          <div className="flex gap-2 mt-4">
            <div className="flex-1 relative">
              <Input
                placeholder="Search by fish type or seller…"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" className="gap-2" type="button">
              <Filter className="w-4 h-4" />
              Filter
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative w-full overflow-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-3 px-4 font-medium">Fish</th>
                  <th className="text-left py-3 px-4 font-medium">Quantity</th>
                  <th className="text-left py-3 px-4 font-medium">Price/kg</th>
                  <th className="text-left py-3 px-4 font-medium">Total</th>
                  <th className="text-left py-3 px-4 font-medium">Seller</th>
                  <th className="text-left py-3 px-4 font-medium">Landing site</th>
                  <th className="text-left py-3 px-4 font-medium">Status</th>
                  <th className="text-left py-3 px-4 font-medium">Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-muted-foreground">
                      {isLoading ? 'Loading…' : 'No listings found'}
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="border-b hover:bg-muted/50">
                      <td className="py-3 px-4 font-medium">{item.fishType}</td>
                      <td className="py-3 px-4">
                        {item.availableQuantity} / {item.quantity} kg
                      </td>
                      <td className="py-3 px-4">KES {item.pricePerKg.toFixed(2)}</td>
                      <td className="py-3 px-4 font-semibold">
                        KES {(item.availableQuantity * item.pricePerKg).toLocaleString()}
                      </td>
                      <td className="py-3 px-4">{item.sellerName}</td>
                      <td className="py-3 px-4 text-muted-foreground">{item.landingSite || item.location}</td>
                      <td className="py-3 px-4">
                        <Badge className={getStatusColor(item.status)}>{item.status}</Badge>
                      </td>
                      <td className="py-3 px-4">
                        {item.status === 'available' ? (
                          <Button variant="ghost" size="sm" onClick={() => openBuy(item)}>
                            Buy
                          </Button>
                        ) : (
                          <Button variant="ghost" size="sm" disabled>
                            View
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showListDialog} onOpenChange={setShowListDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>List catch for sale</DialogTitle>
            <DialogDescription>
              Species must exist in the database (match name or local name) or listing will be rejected.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Fish species</Label>
              <Select value={listFishType} onValueChange={setListFishType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select species from catalog" />
                </SelectTrigger>
                <SelectContent>
                  {speciesList.map((sp) => (
                    <SelectItem key={sp.id} value={sp.name}>
                      {sp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Quantity (kg)</Label>
                <Input type="number" value={listQty} onChange={(e) => setListQty(e.target.value)} min={1} />
              </div>
              <div className="space-y-2">
                <Label>Price / kg (KES)</Label>
                <Input type="number" value={listPrice} onChange={(e) => setListPrice(e.target.value)} min={1} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Grade</Label>
              <Select value={listGrade} onValueChange={setListGrade}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="export">Export</SelectItem>
                  <SelectItem value="local">Local</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Location / county (optional)</Label>
              <Input value={listLocation} onChange={(e) => setListLocation(e.target.value)} placeholder="Mombasa" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowListDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateListing} disabled={submitting}>
              {submitting ? 'Publishing…' : 'Publish'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showBuyDialog} onOpenChange={setShowBuyDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Buy {selectedListing?.fishType}</DialogTitle>
            <DialogDescription>
              Max {selectedListing?.availableQuantity ?? 0} kg available. Total includes tax at checkout (API).
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-2">
              <Label>Quantity (kg)</Label>
              <Input
                type="number"
                value={buyQty}
                onChange={(e) => setBuyQty(e.target.value)}
                min={1}
                max={selectedListing?.availableQuantity ?? 1}
              />
            </div>
            <div className="space-y-2">
              <Label>Delivery address</Label>
              <Input value={buyAddress} onChange={(e) => setBuyAddress(e.target.value)} placeholder="Full address" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBuyDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handlePlaceOrder} disabled={submitting}>
              {submitting ? 'Placing…' : 'Place order'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
