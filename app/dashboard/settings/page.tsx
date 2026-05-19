'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  User,
  Bell,
  Shield,
  Smartphone,
  Globe,
  Moon,
  CreditCard,
  Key,
  Mail,
  Phone,
} from 'lucide-react'
import { toast } from 'sonner'
import { updatePassword, updateProfile, updateNotificationPreferences } from '@/lib/api'

const defaultNotifications = {
  email: true,
  sms: true,
  push: false,
  whatsapp: true,
  climateAlerts: true,
  marketUpdates: true,
  tripReminders: true,
}

type MeUser = {
  id: string
  email: string
  firstName: string
  lastName: string
  phone: string | null
  county?: string | null
  notificationPreferences?: Record<string, unknown> | null
}

export default function SettingsPage() {
  const [loadingMe, setLoadingMe] = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingPassword, setSavingPassword] = useState(false)
  const [savingNotifs, setSavingNotifs] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [county, setCounty] = useState('')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [notifications, setNotifications] = useState({ ...defaultNotifications })

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/auth/me', { credentials: 'same-origin' })
        const json = await res.json()
        if (cancelled || !json.success || !json.data?.user) return
        const u = json.data.user as MeUser
        setFirstName(u.firstName || '')
        setLastName(u.lastName || '')
        setEmail(u.email || '')
        setPhone(u.phone || '')
        setCounty(u.county || '')
        const p = u.notificationPreferences
        if (p && typeof p === 'object' && !Array.isArray(p)) {
          const merged = { ...defaultNotifications }
          for (const key of Object.keys(defaultNotifications) as (keyof typeof defaultNotifications)[]) {
            const v = p[key]
            if (typeof v === 'boolean') merged[key] = v
          }
          setNotifications(merged)
        }
      } catch {
        toast.error('Could not load profile')
      } finally {
        if (!cancelled) setLoadingMe(false)
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const handleSaveProfile = async () => {
    setSavingProfile(true)
    try {
      const json = await updateProfile({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: phone.trim() || undefined,
        county: county.trim() || undefined,
      })
      if (!json.success) {
        toast.error(json.error || 'Save failed')
        return
      }
      toast.success('Profile saved')
    } catch {
      toast.error('Network error')
    } finally {
      setSavingProfile(false)
    }
  }

  const handleUpdatePassword = async () => {
    if (!currentPassword) {
      toast.error('Enter your current password')
      return
    }
    if (!newPassword || newPassword !== confirmPassword) {
      toast.error('Passwords do not match')
      return
    }
    setSavingPassword(true)
    try {
      const json = await updatePassword(currentPassword, newPassword)
      if (!json.success) {
        toast.error(json.error || 'Could not update password')
        return
      }
      toast.success('Password updated')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Network error')
    } finally {
      setSavingPassword(false)
    }
  }

  const handleSaveNotifications = async () => {
    setSavingNotifs(true)
    try {
      const json = await updateNotificationPreferences(notifications)
      if (!json.success) {
        toast.error(json.error || 'Could not save preferences')
        return
      }
      toast.success('Notification preferences saved')
    } catch {
      toast.error('Network error')
    } finally {
      setSavingNotifs(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">
          Profile, password (with current password check), and notification toggles persist on your user row when the DB
          migration has been applied.
        </p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="preferences">Preferences</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Personal information
              </CardTitle>
              <CardDescription>Synced from `/api/auth/me` and saved with `PUT /api/v2/users`</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingMe ? (
                <p className="text-sm text-muted-foreground">Loading profile…</p>
              ) : (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First name</Label>
                      <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last name</Label>
                      <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" type="email" value={email} disabled className="opacity-80" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="county">County (optional)</Label>
                      <Input id="county" value={county} onChange={(e) => setCounty(e.target.value)} />
                    </div>
                  </div>
                  <Button onClick={handleSaveProfile} disabled={savingProfile}>
                    {savingProfile ? 'Saving…' : 'Save changes'}
                  </Button>
                </>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Location & BMU
              </CardTitle>
              <CardDescription>BMU and landing site are assigned administratively</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">
                Contact your BMU official to update registered landing site or license references.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Notification channels
              </CardTitle>
              <CardDescription>
                Stored as JSON in `users.notification_preferences` (run migration if the save fails).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">Email</div>
                    <div className="text-sm text-muted-foreground">Receive updates via email</div>
                  </div>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, email: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">SMS</div>
                    <div className="text-sm text-muted-foreground">Receive updates via SMS</div>
                  </div>
                </div>
                <Switch
                  checked={notifications.sms}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, sms: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Smartphone className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <div className="font-medium">WhatsApp</div>
                    <div className="text-sm text-muted-foreground">Receive updates via WhatsApp</div>
                  </div>
                </div>
                <Switch
                  checked={notifications.whatsapp}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, whatsapp: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Notification types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Climate & weather</div>
                  <div className="text-sm text-muted-foreground">Storm warnings and conditions</div>
                </div>
                <Switch
                  checked={notifications.climateAlerts}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, climateAlerts: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Market updates</div>
                  <div className="text-sm text-muted-foreground">Prices and listings</div>
                </div>
                <Switch
                  checked={notifications.marketUpdates}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, marketUpdates: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Trip reminders</div>
                  <div className="text-sm text-muted-foreground">Scheduled trip alerts</div>
                </div>
                <Switch
                  checked={notifications.tripReminders}
                  onCheckedChange={(checked) => setNotifications((prev) => ({ ...prev, tripReminders: checked }))}
                />
              </div>
            </CardContent>
          </Card>

          <Button onClick={handleSaveNotifications} disabled={savingNotifs}>
            {savingNotifs ? 'Saving…' : 'Save notification preferences'}
          </Button>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Change password
              </CardTitle>
              <CardDescription>
                Requires your current password. New password must include upper, lower, and a number (8+ characters).
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="currentPassword">Current password</Label>
                <Input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  autoComplete="current-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPassword">New password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm new password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  autoComplete="new-password"
                />
              </div>
              <Button onClick={handleUpdatePassword} disabled={savingPassword}>
                {savingPassword ? 'Updating…' : 'Update password'}
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Two-factor authentication
              </CardTitle>
              <CardDescription>Not wired to backend yet</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">SMS verification</div>
                  <div className="text-sm text-muted-foreground">Placeholder toggle</div>
                </div>
                <Switch defaultChecked />
              </div>
              <Button variant="outline" type="button" disabled>
                Manage 2FA
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Moon className="h-5 w-5" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-medium">Dark mode</div>
                  <div className="text-sm text-muted-foreground">UI-only</div>
                </div>
                <Switch />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Payment methods
              </CardTitle>
              <CardDescription>Managed outside this form (wallet / M-Pesa)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 border rounded-lg flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Phone className="h-5 w-5 text-green-600" />
                  <div>
                    <div className="font-medium">M-Pesa</div>
                    <div className="text-sm text-muted-foreground">Use phone on your profile</div>
                  </div>
                </div>
                <Badge>Primary</Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Language & region
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Input id="language" defaultValue="English" disabled />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input id="currency" defaultValue="KES (Kenyan Shilling)" disabled />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
