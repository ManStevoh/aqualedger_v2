'use client'

import { useEffect, useState } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { authFetchJson } from '@/lib/api'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

export type PortalInviteKind = 'vendor' | 'customer'

export interface PortalInviteDefaults {
  email?: string
  firstName?: string
  lastName?: string
  phone?: string
  shopName?: string
  customerId?: string
}

interface PortalInviteDialogProps {
  kind: PortalInviteKind
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
  defaults?: PortalInviteDefaults
}

function splitName(full: string): { firstName: string; lastName: string } {
  const parts = full.trim().split(/\s+/)
  if (parts.length === 0) return { firstName: '', lastName: '' }
  if (parts.length === 1) return { firstName: parts[0], lastName: 'User' }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

export function PortalInviteDialog({
  kind,
  open,
  onOpenChange,
  onSuccess,
  defaults,
}: PortalInviteDialogProps) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [shopName, setShopName] = useState('')
  const [commissionRate, setCommissionRate] = useState('10')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setEmail(defaults?.email ?? '')
    setFirstName(defaults?.firstName ?? '')
    setLastName(defaults?.lastName ?? '')
    setPhone(defaults?.phone ?? '')
    setShopName(defaults?.shopName ?? '')
    setPassword('')
    setCommissionRate('10')
    if (!defaults?.firstName && defaults?.shopName && kind === 'vendor') {
      setFirstName(defaults.shopName)
    }
  }, [open, defaults, kind])

  const submit = async () => {
    if (!email.trim()) {
      toast.error('Email is required')
      return
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and last name are required')
      return
    }
    if (kind === 'vendor' && !shopName.trim()) {
      toast.error('Shop name is required')
      return
    }

    setSubmitting(true)
    try {
      const url =
        kind === 'vendor'
          ? '/api/v2/commerce/vendors/invite'
          : '/api/v2/crm/customers/invite'

      const body =
        kind === 'vendor'
          ? {
              email: email.trim(),
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              shopName: shopName.trim(),
              phone: phone.trim() || undefined,
              password: password.trim() || undefined,
              commissionRate: Number(commissionRate) || 10,
            }
          : {
              email: email.trim(),
              firstName: firstName.trim(),
              lastName: lastName.trim(),
              phone: phone.trim() || undefined,
              password: password.trim() || undefined,
              customerId: defaults?.customerId,
            }

      const res = await authFetchJson<{
        success: boolean
        error?: string
        data?: { message?: string; createdUser?: boolean }
      }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.success) {
        throw new Error(res.error || 'Invite failed')
      }

      toast.success(
        res.data?.message ||
          (kind === 'vendor'
            ? 'Vendor can sign in at /login'
            : 'Client can sign in at /login'),
      )
      onOpenChange(false)
      onSuccess?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invite failed')
    } finally {
      setSubmitting(false)
    }
  }

  const title = kind === 'vendor' ? 'Invite vendor (seller portal)' : 'Invite client (buyer portal)'
  const description =
    kind === 'vendor'
      ? 'Creates a login, tenant membership (vendor role), and marketplace vendor record. Set a password for new accounts.'
      : 'Creates a login and tenant membership (customer role). Links to the CRM record when opened from a customer row.'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="portal-email">Email</Label>
            <Input
              id="portal-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="portal-first">First name</Label>
              <Input
                id="portal-first"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="portal-last">Last name</Label>
              <Input
                id="portal-last"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          {kind === 'vendor' && (
            <div className="space-y-2">
              <Label htmlFor="portal-shop">Shop name</Label>
              <Input
                id="portal-shop"
                value={shopName}
                onChange={(e) => setShopName(e.target.value)}
              />
            </div>
          )}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="portal-phone">Phone (optional)</Label>
              <Input id="portal-phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
            </div>
            {kind === 'vendor' && (
              <div className="space-y-2">
                <Label htmlFor="portal-rate">Commission %</Label>
                <Input
                  id="portal-rate"
                  type="number"
                  min={0}
                  max={100}
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="portal-password">Password (new accounts)</Label>
            <Input
              id="portal-password"
              type="password"
              placeholder="Min 8 characters if new user"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
            <p className="text-xs text-muted-foreground">
              Leave blank only when linking an existing user who already has a password.
            </p>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" type="button" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={submit} disabled={submitting}>
            {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
            Send invite
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function portalDefaultsFromCustomer(customer: {
  id: string
  name: string
  email: string | null
  phone: string | null
}): PortalInviteDefaults {
  const { firstName, lastName } = splitName(customer.name)
  return {
    customerId: customer.id,
    email: customer.email ?? '',
    firstName,
    lastName,
    phone: customer.phone ?? '',
  }
}
