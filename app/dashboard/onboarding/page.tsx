'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { authFetchJson } from '@/lib/api'
import { updateProfile } from '@/lib/api'
import { CheckCircle2, Loader2, Rocket, Settings2, UserCircle2 } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

type OnboardingData = {
  tenant_id: string
  step: number
  completed_steps: number[]
  business_type: string
  isComplete: boolean
  currentStep: string
  totalSteps: number
}

const STEPS = [
  { num: 1, key: 'profile', title: 'Profile', icon: UserCircle2, desc: 'Complete your profile' },
  { num: 2, key: 'operations', title: 'Operations', icon: Settings2, desc: 'Set up your workspace' },
  { num: 3, key: 'go-live', title: 'Go live', icon: Rocket, desc: 'Review and launch' },
]

export default function OnboardingPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [onboarding, setOnboarding] = useState<OnboardingData | null>(null)
  const [activeStep, setActiveStep] = useState(1)

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [phone, setPhone] = useState('')
  const [county, setCounty] = useState('')
  const [currency, setCurrency] = useState('KES')
  const [timezone, setTimezone] = useState('Africa/Nairobi')

  useEffect(() => {
    Promise.all([
      authFetchJson<{ success: boolean; data?: { isComplete: boolean; onboarding: OnboardingData | null } }>(
        '/api/v2/tenant/onboarding',
      ),
      authFetchJson<{
        success: boolean
        data?: { user: { firstName: string; lastName: string; phone: string | null; county?: string | null } }
      }>('/api/auth/me'),
    ])
      .then(([onbRes, meRes]) => {
        if (onbRes.success && onbRes.data?.isComplete) {
          router.replace('/dashboard')
          return
        }
        if (onbRes.success && onbRes.data?.onboarding) {
          setOnboarding(onbRes.data.onboarding)
          setActiveStep(onbRes.data.onboarding.step)
        }
        if (meRes.success && meRes.data?.user) {
          setFirstName(meRes.data.user.firstName)
          setLastName(meRes.data.user.lastName)
          setPhone(meRes.data.user.phone ?? '')
          setCounty(meRes.data.user.county ?? '')
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  const patchOnboarding = async (payload: {
    step?: number
    completeStep?: number
    finish?: boolean
  }) => {
    const res = await authFetchJson<{
      success: boolean
      data?: { isComplete: boolean; onboarding: OnboardingData }
      error?: string
    }>('/api/v2/tenant/onboarding', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    if (!res.success || !res.data) {
      throw new Error(res.error || 'Failed to update onboarding')
    }
    setOnboarding(res.data.onboarding)
    return res.data
  }

  const handleProfileNext = async () => {
    setSaving(true)
    try {
      const profileRes = await updateProfile({ firstName, lastName, phone, county })
      if (!profileRes.success) {
        toast.error(profileRes.error || 'Failed to save profile')
        return
      }
      const data = await patchOnboarding({ completeStep: 1, step: 2 })
      setActiveStep(2)
      if (data.isComplete) router.replace('/dashboard')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleOperationsNext = async () => {
    setSaving(true)
    try {
      const res = await authFetchJson<{ success: boolean; error?: string }>('/api/v2/tenant', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ defaultCurrency: currency }),
      })
      if (!res.success) {
        toast.error(res.error || 'Failed to save settings')
        return
      }
      const data = await patchOnboarding({ completeStep: 2, step: 3 })
      setActiveStep(3)
      if (data.isComplete) router.replace('/dashboard')
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  const handleFinish = async () => {
    setSaving(true)
    try {
      const data = await patchOnboarding({ completeStep: 3, finish: true })
      toast.success('You are all set!')
      router.replace('/dashboard')
      if (!data.isComplete) router.refresh()
    } catch (e) {
      toast.error(e instanceof Error ? e.message : 'Something went wrong')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="text-center">
        <h1 className="text-2xl font-bold tracking-tight">Welcome to AquaERP</h1>
        <p className="mt-1 text-muted-foreground">
          Complete these steps to set up{' '}
          {onboarding?.business_type ? onboarding.business_type.replace('_', ' ') : 'your organization'}
        </p>
      </div>

      <div className="flex justify-center gap-4">
        {STEPS.map(({ num, title, icon: Icon, desc }) => {
          const done = onboarding?.completed_steps.includes(num)
          const current = activeStep === num
          return (
            <div key={num} className="flex flex-col items-center gap-1 text-center">
              <div
                className={cn(
                  'flex h-10 w-10 items-center justify-center rounded-full border-2',
                  done
                    ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600'
                    : current
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-muted text-muted-foreground',
                )}
              >
                {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
              </div>
              <p className="text-xs font-medium">{title}</p>
              <p className="hidden text-[10px] text-muted-foreground sm:block">{desc}</p>
            </div>
          )
        })}
      </div>

      {activeStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Tell us about yourself</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+254712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="county">County / region</Label>
              <Input
                id="county"
                placeholder="e.g. Kisumu"
                value={county}
                onChange={(e) => setCounty(e.target.value)}
              />
            </div>
            <Button onClick={handleProfileNext} disabled={saving}>
              {saving ? 'Saving…' : 'Continue'}
            </Button>
          </CardContent>
        </Card>
      )}

      {activeStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Operations</CardTitle>
            <CardDescription>Configure defaults for your workspace</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Default currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="KES">KES — Kenyan Shilling</SelectItem>
                  <SelectItem value="TZS">TZS — Tanzanian Shilling</SelectItem>
                  <SelectItem value="UGX">UGX — Ugandan Shilling</SelectItem>
                  <SelectItem value="USD">USD — US Dollar</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Timezone</Label>
              <Select value={timezone} onValueChange={setTimezone}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Africa/Nairobi">Africa/Nairobi (EAT)</SelectItem>
                  <SelectItem value="Africa/Dar_es_Salaam">Africa/Dar es Salaam</SelectItem>
                  <SelectItem value="Africa/Kampala">Africa/Kampala</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setActiveStep(1)}>
                Back
              </Button>
              <Button onClick={handleOperationsNext} disabled={saving}>
                {saving ? 'Saving…' : 'Continue'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {activeStep === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Go live</CardTitle>
            <CardDescription>Review your setup and enter the dashboard</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ul className="space-y-2 text-sm">
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Profile configured for {firstName} {lastName}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Currency set to {currency}
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Business type: {onboarding?.business_type ?? '—'}
              </li>
            </ul>
            <p className="text-sm text-muted-foreground">
              You can invite team members and configure modules from Organization settings anytime.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setActiveStep(2)}>
                Back
              </Button>
              <Button onClick={handleFinish} disabled={saving}>
                {saving ? 'Finishing…' : 'Go to dashboard'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
