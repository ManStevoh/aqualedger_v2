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
import { DashboardPageLayout } from '@/components/dashboard/dashboard-page-layout'
import { authFetchJson } from '@/lib/api'
import { updateProfile } from '@/lib/api'
import Link from 'next/link'
import {
  CheckCircle2,
  Loader2,
  Rocket,
  Settings2,
  UserCircle2,
  Smartphone,
  Ship,
  Users,
  Store,
  Shield,
} from 'lucide-react'
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
  const [mpesaStatus, setMpesaStatus] = useState<{
    mode: string
    configured: boolean
    callbackUrl: string
    testPhone: string | null
  } | null>(null)
  const [mpesaTesting, setMpesaTesting] = useState(false)
  const [mfaEnabled, setMfaEnabled] = useState(false)

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

  useEffect(() => {
    if (activeStep !== 3) return
    Promise.all([
      authFetchJson<{
        success: boolean
        data?: { mode: string; configured: boolean; callbackUrl: string; testPhone: string | null }
      }>('/api/v2/integrations/mpesa/status'),
      authFetchJson<{ success: boolean; data?: { mfa?: { enabled: boolean } } }>(
        '/api/v2/auth/mfa',
      ),
    ])
      .then(([mpesaRes, mfaRes]) => {
        if (mpesaRes.success && mpesaRes.data) setMpesaStatus(mpesaRes.data)
        if (mfaRes.success && mfaRes.data?.mfa) setMfaEnabled(mfaRes.data.mfa.enabled)
      })
      .catch(() => {})
  }, [activeStep])

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
        body: JSON.stringify({ defaultCurrency: currency, timezone }),
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
    <DashboardPageLayout
      title="Welcome to AquaERP"
      description={`Complete these steps to set up ${
        onboarding?.business_type ? onboarding.business_type.replace('_', ' ') : 'your organization'
      }`}
    >
      <div className="mx-auto max-w-3xl space-y-8">
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
            <div className="grid gap-2 sm:grid-cols-3">
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link href="/dashboard/fleet">
                  <Ship className="h-4 w-4" />
                  Add a boat
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link href="/dashboard/team">
                  <Users className="h-4 w-4" />
                  Invite team
                </Link>
              </Button>
              <Button variant="outline" className="justify-start gap-2" asChild>
                <Link href="/dashboard/commerce/storefront">
                  <Store className="h-4 w-4" />
                  Storefront
                </Link>
              </Button>
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
            {mpesaStatus && (
              <Card className="border-dashed">
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <Smartphone className="h-4 w-4" />
                    M-Pesa ({mpesaStatus.mode})
                  </CardTitle>
                  <CardDescription>
                    {mpesaStatus.configured
                      ? 'Daraja credentials detected. Send a sandbox STK to your test phone.'
                      : 'Stub mode — set MPESA_* in .env for live Daraja. See docs/MPESA_SANDBOX.md'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs text-muted-foreground break-all">
                    Callback: {mpesaStatus.callbackUrl}
                  </p>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={mpesaTesting}
                    onClick={async () => {
                      setMpesaTesting(true)
                      try {
                        const res = await authFetchJson<{
                          success: boolean
                          data?: { message?: string }
                          error?: string
                        }>('/api/v2/integrations', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ action: 'test', provider: 'mpesa' }),
                        })
                        if (res.success) {
                          toast.success(res.data?.message || 'STK test sent')
                        } else {
                          toast.error(res.error || 'Test failed')
                        }
                      } catch {
                        toast.error('Network error')
                      } finally {
                        setMpesaTesting(false)
                      }
                    }}
                  >
                    {mpesaTesting ? 'Sending…' : 'Send sandbox STK test'}
                  </Button>
                </CardContent>
              </Card>
            )}
            <Card className="border-dashed">
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  Two-factor authentication
                </CardTitle>
                <CardDescription>
                  {mfaEnabled
                    ? 'MFA is enabled for your account.'
                    : 'Recommended for tenant owners — enroll with Google Authenticator or similar.'}
                </CardDescription>
              </CardHeader>
              {!mfaEnabled && (
                <CardContent>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/dashboard/settings/security">Set up MFA</Link>
                  </Button>
                </CardContent>
              )}
            </Card>
            <p className="text-sm text-muted-foreground">
              Optional: test M-Pesa and MFA now, or finish and configure later under Settings.
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
    </DashboardPageLayout>
  )
}
