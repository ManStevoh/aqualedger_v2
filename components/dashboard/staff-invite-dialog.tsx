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

interface StaffInviteDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSuccess?: () => void
}

const staffRoles = [
  { value: 'branch_manager', label: 'Branch Manager' },
  { value: 'accountant', label: 'Accountant' },
  { value: 'procurement_officer', label: 'Procurement Officer' },
  { value: 'warehouse_staff', label: 'Warehouse Staff' },
  { value: 'fisherman', label: 'Fisherman' },
  { value: 'hr_officer', label: 'HR Officer' },
  { value: 'bmu_official', label: 'BMU Official' },
] as const

export function StaffInviteDialog({
  open,
  onOpenChange,
  onSuccess,
}: StaffInviteDialogProps) {
  const [email, setEmail] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<string>('accountant')
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!open) return
    setEmail('')
    setFirstName('')
    setLastName('')
    setPhone('')
    setPassword('')
    setRole('accountant')
  }, [open])

  const submit = async () => {
    if (!email.trim()) {
      toast.error('Email is required')
      return
    }
    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First and last name are required')
      return
    }
    if (!password.trim()) {
      toast.error('Password is required for new accounts')
      return
    }
    if (password.length < 8) {
      toast.error('Password must be at least 8 characters long')
      return
    }

    setSubmitting(true)
    try {
      const url = '/api/v2/users'
      const body = {
        email: email.trim(),
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        password: password.trim(),
        role: role,
      }

      const res = await authFetchJson<{
        success: boolean
        error?: string
        data?: { id: string }
      }>(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      if (!res.success) {
        throw new Error(res.error || 'Failed to create team member')
      }

      toast.success('Team member invited successfully! They can now sign in at /login.')
      onOpenChange(false)
      onSuccess?.()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Invite failed')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Staff Member</DialogTitle>
          <DialogDescription>
            Creates login credentials, a digital wallet, a credit score, and links them to your organization with their specific ERP role.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-2">
          <div className="space-y-2">
            <Label htmlFor="staff-email">Email Address</Label>
            <Input
              id="staff-email"
              type="email"
              placeholder="e.g. employee@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="staff-first">First Name</Label>
              <Input
                id="staff-first"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-last">Last Name</Label>
              <Input
                id="staff-last"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="staff-phone">Phone (optional)</Label>
              <Input
                id="staff-phone"
                placeholder="+254..."
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="staff-role">Operational Role</Label>
              <select
                id="staff-role"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {staffRoles.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="staff-password">Temporary Password</Label>
            <Input
              id="staff-password"
              type="password"
              placeholder="Min 8 characters (with uppercase, lowercase, number)"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="new-password"
            />
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
