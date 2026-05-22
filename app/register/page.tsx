'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { apiFetch } from '@/lib/client-api'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'
import {
  Anchor,
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
  const router = useRouter()
  const [step, setStep] = useState(1)
  const [businessType, setBusinessType] = useState<BusinessType>('fisherman')
  const [organizationName, setOrganizationName] = useState('')
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

  const canProceedStep1 = organizationName.trim().length >= 2

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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-violet-600/20 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-600">
            <Anchor className="h-7 w-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">{APP_NAME}</h1>
          <p className="text-sm text-slate-400">{APP_TAGLINE}</p>
        </div>

        <div className="mb-6 flex items-center justify-center gap-2">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div
                className={cn(
                  'flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium',
                  step >= s
                    ? 'bg-gradient-to-r from-cyan-500 to-violet-600 text-white'
                    : 'border border-white/20 text-slate-500',
                )}
              >
                {s}
              </div>
              {s === 1 && <div className={cn('h-px w-12', step > 1 ? 'bg-cyan-500' : 'bg-white/10')} />}
            </div>
          ))}
        </div>

        <div className="mb-4 space-y-1 text-center">
          <h2 className="text-lg font-semibold text-white">
            {step === 1 ? 'Your organization' : 'Your account'}
          </h2>
          <p className="text-sm text-slate-400">
            {step === 1
              ? 'Choose your business type and organization name'
              : 'Password must be 8+ chars with upper, lower, and a number'}
          </p>
        </div>

        {signupLocked && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-100"
          >
            <p className="font-medium">Registration is currently closed</p>
            <p className="mt-1 text-amber-200/90">
              New signups are temporarily disabled. If you already have an account,{' '}
              <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
                sign in here
              </Link>
              .
            </p>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {step === 1 ? (
          <form onSubmit={handleStep1Next} className="space-y-4">
            <fieldset disabled={signupLocked || statusLoading} className="space-y-4 disabled:opacity-60">
            <div className="space-y-2">
              <Label className="text-slate-300">Business type</Label>
              <div className="grid gap-2">
                {BUSINESS_TYPES.map(({ value, label, description, icon: Icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setBusinessType(value)}
                    className={cn(
                      'flex items-start gap-3 rounded-xl border p-3 text-left transition-colors',
                      businessType === value
                        ? 'border-cyan-500/50 bg-cyan-500/10'
                        : 'border-white/10 bg-slate-900/50 hover:border-white/20',
                    )}
                  >
                    <Icon
                      className={cn(
                        'mt-0.5 h-5 w-5 shrink-0',
                        businessType === value ? 'text-cyan-400' : 'text-slate-500',
                      )}
                    />
                    <div>
                      <p className="text-sm font-medium text-white">{label}</p>
                      <p className="text-xs text-slate-500">{description}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="organizationName" className="text-slate-300">
                Organization name
              </Label>
              <Input
                id="organizationName"
                required
                value={organizationName}
                onChange={(e) => {
                  setOrganizationName(e.target.value)
                  if (error) setError(null)
                }}
                placeholder="Lake Victoria Fisheries Co-op"
                className="border-white/10 bg-slate-900/80 text-white placeholder:text-slate-500"
              />
            </div>

            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:from-cyan-400 hover:to-violet-500"
              disabled={!canProceedStep1 || signupLocked || statusLoading}
            >
              Continue
              <ChevronRight className="ml-2 h-4 w-4" />
            </Button>
            </fieldset>
          </form>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <fieldset disabled={signupLocked || statusLoading} className="space-y-4 disabled:opacity-60">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="text-slate-300">
                  First name
                </Label>
                <Input
                  id="firstName"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="border-white/10 bg-slate-900/80 text-white"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName" className="text-slate-300">
                  Last name
                </Label>
                <Input
                  id="lastName"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="border-white/10 bg-slate-900/80 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="border-white/10 bg-slate-900/80 text-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone" className="text-slate-300">
                Phone (optional)
              </Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+254712345678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="border-white/10 bg-slate-900/80 text-white placeholder:text-slate-500"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-slate-300">
                Password
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border-white/10 bg-slate-900/80 pr-10 text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
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
                className="border-white/10 bg-transparent text-slate-300 hover:bg-white/5"
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
                className="flex-1 bg-gradient-to-r from-cyan-500 to-violet-600 text-white hover:from-cyan-400 hover:to-violet-500"
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

        <p className="mt-6 text-center text-sm text-slate-400">
          Already have an account?{' '}
          <Link href="/login" className="font-medium text-cyan-400 hover:text-cyan-300">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
