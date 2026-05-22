'use client'

import { useEffect, useState, useMemo } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/client-api'
import { BrandMark } from '@/components/branding/brand-mark'
import { usePlatformBrand } from '@/components/branding/platform-brand-provider'
import { useRecaptcha } from '@/components/security/use-recaptcha'
import { RecaptchaNotice } from '@/components/security/recaptcha-notice'
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  EyeOff,
  Fish,
  Ship,
  Store,
  Truck,
} from 'lucide-react'
import { cn } from '@/lib/utils'

type BusinessType = 'fisherman' | 'cooperative' | 'processor' | 'market' | 'exporter'

const BUSINESS_TYPES: {
  value: BusinessType
  label: string
  description: string
  icon: typeof Fish
}[] = [
  {
    value: 'fisherman',
    label: 'Fisherman',
    description: 'Individual or small crew operations',
    icon: Fish,
  },
  {
    value: 'cooperative',
    label: 'Cooperative',
    description: 'BMU or fishing cooperative',
    icon: Ship,
  },
  {
    value: 'processor',
    label: 'Processor',
    description: 'Fish processing & cold storage',
    icon: Building2,
  },
  {
    value: 'market',
    label: 'Market',
    description: 'Retail, wholesale, or auction',
    icon: Store,
  },
  {
    value: 'exporter',
    label: 'Exporter',
    description: 'Export & international trade',
    icon: Truck,
  },
]

export default function RegisterPage() {
  const brand = usePlatformBrand()
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [businessType, setBusinessType] = useState<BusinessType>('fisherman')
  const [organizationName, setOrganizationName] = useState('')
  const [customizeSlug, setCustomizeSlug] = useState(false)
  const [tenantSlug, setTenantSlug] = useState('')
  const [slugPreview, setSlugPreview] = useState<{
    slug: string
    available: boolean
    subdomainHost: string
    subdomainUrl: string
    error?: string
  } | null>(null)
  const [slugChecking, setSlugChecking] = useState(false)
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [signupLocked, setSignupLocked] = useState(false)
  const [statusLoading, setStatusLoading] = useState(true)
  const recaptcha = useRecaptcha('register')

  useEffect(() => {
    let cancelled = false
    fetch('/api/public/platform/status', { credentials: 'same-origin' })
      .then((res) => res.json())
      .then((json: { success?: boolean; data?: { signupLocked?: boolean } }) => {
        if (!cancelled && json.success && json.data) {
          setSignupLocked(Boolean(json.data.signupLocked))
        }
      })
      .catch(() => {})
      .finally(() => {
        if (!cancelled) setStatusLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const canProceedStep1 =
    organizationName.trim().length >= 2 &&
    slugPreview?.available === true &&
    !slugChecking

  useEffect(() => {
    if (organizationName.trim().length < 2) {
      setSlugPreview(null)
      return
    }
    const q = customizeSlug && tenantSlug.trim() ? tenantSlug.trim() : organizationName.trim()
    const t = window.setTimeout(() => {
      setSlugChecking(true)
      const params = new URLSearchParams()
      if (customizeSlug && tenantSlug.trim()) {
        params.set('slug', tenantSlug.trim())
      } else {
        params.set('organization', organizationName.trim())
      }
      fetch(`/api/public/tenant-slug/check?${params}`)
        .then((r) => r.json())
        .then(
          (json: {
            success?: boolean
            data?: {
              slug: string
              available: boolean
              subdomainHost?: string
              subdomainUrl?: string
              error?: string
            }
          }) => {
            if (json.success && json.data) {
              setSlugPreview({
                slug: json.data.slug,
                available: json.data.available,
                subdomainHost: json.data.subdomainHost ?? `${json.data.slug}.localhost`,
                subdomainUrl: json.data.subdomainUrl ?? '',
                error: json.data.error,
              })
              if (customizeSlug && !tenantSlug) {
                setTenantSlug(json.data.slug)
              }
            }
          },
        )
        .catch(() => setSlugPreview(null))
        .finally(() => setSlugChecking(false))
    }, 400)
    return () => window.clearTimeout(t)
  }, [organizationName, tenantSlug, customizeSlug])

  const slugHint = useMemo(() => {
    if (slugChecking) return 'Checking subdomain…'
    if (!slugPreview) return null
    if (!slugPreview.available) return slugPreview.error ?? 'Subdomain not available'
    return `Your storefront: ${slugPreview.subdomainHost}`
  }, [slugPreview, slugChecking])

  const handleStep1Next = (e: React.FormEvent) => {
    e.preventDefault()
    if (!canProceedStep1) {
      setError('Enter your organization name (at least 2 characters).')
      return
    }
    setError(null)
    setStep(2)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      let recaptchaToken: string | undefined
      if (recaptcha.active) {
        if (!recaptcha.ready) {
          setError('Security check is loading. Please wait a moment.')
          return
        }
        recaptchaToken = await recaptcha.getToken()
        if (!recaptchaToken) {
          setError(
            recaptcha.isV2
              ? 'Please complete the security check.'
              : 'Security verification failed. Please try again.',
          )
          recaptcha.reset()
          return
        }
      }

      const res = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          password,
          phone: phone || undefined,
          organizationName: organizationName.trim(),
          businessType,
          tenantSlug:
            customizeSlug && tenantSlug.trim() ? tenantSlug.trim() : slugPreview?.slug,
          recaptchaToken,
        }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error || 'Registration failed')
        recaptcha.reset()
        return
      }
      router.push('/dashboard/onboarding')
      router.refresh()
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Card className="relative w-full max-w-lg border-border bg-card shadow-sm">
        <CardHeader className="space-y-4 pb-0 text-center">
          <div className="mx-auto flex flex-col items-center gap-3">
            <BrandMark size="lg" brand={brand} />
            <div>
              <CardTitle className="text-2xl">{brand.appName}</CardTitle>
              <CardDescription>{brand.tagline}</CardDescription>
            </div>
          </div>

          <div className="flex items-center justify-center gap-2">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                    step >= s
                      ? 'bg-primary text-primary-foreground'
                      : 'border border-border text-muted-foreground',
                  )}
                >
                  {s}
                </div>
                {s === 1 && (
                  <div className={cn('h-px w-12', step > 1 ? 'bg-primary' : 'bg-border')} />
                )}
              </div>
            ))}
          </div>

          <div className="space-y-1">
            <CardTitle className="text-lg">
              {step === 1 ? 'Your organization' : 'Your account'}
            </CardTitle>
            <CardDescription>
              {step === 1
                ? 'Choose your business type and organization name'
                : 'Password must be 8+ chars with upper, lower, and a number'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {signupLocked && (
            <div
              role="alert"
              className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-900 dark:text-amber-100"
            >
              <p className="font-medium">Registration is currently closed</p>
              <p className="mt-1 text-amber-800/90 dark:text-amber-200/90">
                New signups are temporarily disabled. If you already have an account,{' '}
                <Link href="/login" className="font-medium text-primary hover:text-primary/80">
                  sign in here
                </Link>
                .
              </p>
            </div>
          )}

          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {step === 1 ? (
            <form onSubmit={handleStep1Next} className="space-y-4">
              <fieldset
                disabled={signupLocked || statusLoading}
                className="space-y-4 disabled:opacity-60"
              >
                <div className="space-y-2">
                  <Label>Business type</Label>
                  <div className="grid gap-2">
                    {BUSINESS_TYPES.map(({ value, label, description, icon: Icon }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setBusinessType(value)}
                        className={cn(
                          'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                          businessType === value
                            ? 'border-primary/50 bg-primary/5'
                            : 'border-border bg-muted/30 hover:border-primary/30',
                        )}
                      >
                        <Icon
                          className={cn(
                            'mt-0.5 h-5 w-5 shrink-0',
                            businessType === value ? 'text-primary' : 'text-muted-foreground',
                          )}
                        />
                        <div>
                          <p className="text-sm font-medium text-foreground">{label}</p>
                          <p className="text-xs text-muted-foreground">{description}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization name</Label>
                  <Input
                    id="organizationName"
                    required
                    value={organizationName}
                    onChange={(e) => {
                      setOrganizationName(e.target.value)
                      if (error) setError(null)
                    }}
                    placeholder="Lake Victoria Fisheries Co-op"
                  />
                </div>

                {slugHint && (
                  <div
                    className={cn(
                      'rounded-lg border px-3 py-2 text-sm',
                      slugPreview?.available
                        ? 'border-primary/30 bg-primary/5 text-foreground'
                        : 'border-destructive/30 bg-destructive/5 text-destructive',
                    )}
                  >
                    {slugHint}
                    {slugPreview?.available && slugPreview.subdomainUrl && (
                      <p className="mt-1 text-xs text-muted-foreground font-mono break-all">
                        {slugPreview.subdomainUrl}
                      </p>
                    )}
                  </div>
                )}

                <label className="flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={customizeSlug}
                    onChange={(e) => setCustomizeSlug(e.target.checked)}
                    className="rounded border-border"
                  />
                  Choose a custom subdomain
                </label>

                {customizeSlug && (
                  <div className="space-y-2">
                    <Label htmlFor="tenantSlug">Subdomain</Label>
                    <div className="flex items-center gap-1">
                      <Input
                        id="tenantSlug"
                        value={tenantSlug}
                        onChange={(e) => setTenantSlug(e.target.value.toLowerCase())}
                        placeholder="coastfish"
                        className="font-mono"
                      />
                      <span className="text-sm text-muted-foreground shrink-0">.your-platform</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Letters, numbers, and hyphens only. Custom domains (e.g. shop.yourbrand.com) can be
                      added later in Organization → Domains.
                    </p>
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full"
                  disabled={!canProceedStep1 || signupLocked || statusLoading}
                >
                  Continue
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </fieldset>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <fieldset
                disabled={signupLocked || statusLoading}
                className="space-y-4 disabled:opacity-60"
              >
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First name</Label>
                    <Input
                      id="firstName"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last name</Label>
                    <Input
                      id="lastName"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (optional)</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+254712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                {recaptcha.active && recaptcha.isV2 && (
                  <div ref={recaptcha.v2ContainerRef} className="flex justify-center" />
                )}

                {recaptcha.active && (
                  <div className="pt-1">
                    <RecaptchaNotice />
                  </div>
                )}

                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setStep(1)
                      setError(null)
                    }}
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" />
                    Back
                  </Button>
                  <Button
                    type="submit"
                    className="flex-1"
                    disabled={
                      submitting ||
                      signupLocked ||
                      statusLoading ||
                      (recaptcha.active && !recaptcha.ready)
                    }
                  >
                    {submitting ? 'Creating account…' : 'Create account'}
                  </Button>
                </div>
              </fieldset>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link href="/login" className="font-medium text-primary hover:text-primary/80">
              Sign in
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
