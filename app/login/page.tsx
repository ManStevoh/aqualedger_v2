'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { apiFetch } from '@/lib/client-api'
import { BrandMark } from '@/components/branding/brand-mark'
import { usePlatformBrand } from '@/components/branding/platform-brand-provider'
import { useRecaptcha } from '@/components/security/use-recaptcha'
import { RecaptchaNotice } from '@/components/security/recaptcha-notice'
import {
  Building2,
  Eye,
  EyeOff,
  Fish,
  Ship,
  Store,
  Truck,
} from 'lucide-react'

const ROLE_HINTS = [
  { icon: Fish, label: 'Fishermen', hint: 'Log catches & trips' },
  { icon: Ship, label: 'Cooperatives', hint: 'Manage fleets & crews' },
  { icon: Building2, label: 'Processors', hint: 'Track inventory & HACCP' },
  { icon: Store, label: 'Markets', hint: 'Sell & fulfill orders' },
  { icon: Truck, label: 'Exporters', hint: 'Traceability & logistics' },
]

function LoginForm() {
  const brand = usePlatformBrand()
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/dashboard'
  const errorParam = searchParams.get('error')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(
    errorParam === 'no_membership'
      ? 'Your account does not have access to any business dashboards. Please log in to your cooperative storefront instead.'
      : null
  )
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaChallenge, setMfaChallenge] = useState('')
  const [mfaToken, setMfaToken] = useState('')
  const [mfaEmail, setMfaEmail] = useState('')
  const recaptcha = useRecaptcha('login')

  const performSubdomainRedirect = (tenantSlug: string | null, userRole: string) => {
    if (userRole === 'super_admin') {
      const redirectUrl = from !== '/dashboard' && from.startsWith('/') ? from : '/admin'
      router.push(redirectUrl)
      router.refresh()
      return
    }

    if (!tenantSlug || userRole === 'investor') {
      router.push(from.startsWith('/') ? from : '/dashboard')
      router.refresh()
      return
    }

    const { hostname, protocol, port } = window.location
    const portSuffix = port ? `:${port}` : ''
    const currentHost = hostname.toLowerCase()

    // For localhost development: cookies are host-only so a cross-origin redirect
    // to a different subdomain would lose the session. Always stay on the same origin.
    if (currentHost === 'localhost' || currentHost === '127.0.0.1' || currentHost.endsWith('.localhost')) {
      // If already on the correct subdomain (e.g. coastfish.localhost) or on bare localhost,
      // just navigate within the same origin.
      router.push(from.startsWith('/') ? from : '/dashboard')
      router.refresh()
      return
    }

    // Public Home Lab testing / Subdomain staging — no nested subdomain redirects (Cloudflare SSL depth limit / no wildcard DNS)
    if (hostname === 'aqua.kenwafula.cv' || hostname === 'fishos.aqualedger.co.ke') {
      router.push(from.startsWith('/') ? from : '/dashboard')
      router.refresh()
      return
    }

    // Production: build the base host by stripping any existing tenant prefix / reserved subdomain.
    let baseHost = currentHost.replace(/^www\./i, '')
    if (baseHost.startsWith(tenantSlug + '.')) {
      baseHost = baseHost.slice(tenantSlug.length + 1)
    } else {
      const RESERVED = ['app', 'api', 'admin', 'dashboard', 'store', 'login', 'register']
      for (const sub of RESERVED) {
        if (baseHost.startsWith(sub + '.')) {
          baseHost = baseHost.slice(sub.length + 1)
          break
        }
      }
    }

    // Only do a cross-origin redirect in production where shared-domain cookies work.
    const targetHost = `${tenantSlug}.${baseHost}`
    if (targetHost !== currentHost) {
      window.location.href = `${protocol}//${targetHost}${portSuffix}/dashboard`
    } else {
      router.push(from.startsWith('/') ? from : '/dashboard')
      router.refresh()
    }
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

      const res = await apiFetch('/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ email, password, rememberMe, recaptchaToken }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error || 'Login failed')
        recaptcha.reset()
        return
      }
      if (json.mfaRequired && json.data?.mfaChallenge) {
        setMfaRequired(true)
        setMfaChallenge(json.data.mfaChallenge)
        setMfaEmail(json.data.user?.email || email)
        return
      }
      performSubdomainRedirect(json.data?.user?.tenantSlug || null, json.data?.user?.role || 'user')
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleMfaSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const res = await apiFetch('/auth/login/mfa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ mfaChallenge, token: mfaToken }),
      })
      const json = await res.json()
      if (!res.ok || !json.success) {
        setError(json.error || 'Verification failed')
        return
      }
      performSubdomainRedirect(json.data?.user?.tenantSlug || null, json.data?.user?.role || 'user')
    } catch {
      setError('Network error. Check your connection and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="grid w-full max-w-5xl gap-8 lg:grid-cols-[1fr_420px]">
      <div className="hidden flex-col justify-center lg:flex">
        <div className="mb-8 flex items-center gap-3">
          <BrandMark brand={brand} />
          <div>
            <p className="text-xl font-semibold tracking-tight text-foreground">{brand.appName}</p>
            <p className="text-sm text-muted-foreground">{brand.tagline}</p>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Maritime commerce, simplified.
        </h1>
        <p className="mt-3 max-w-md text-muted-foreground">
          One platform for BMU operations, cold chain, marketplace, and finance — built for
          Africa&apos;s blue economy.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {ROLE_HINTS.map(({ icon: Icon, label, hint }) => (
            <div key={label} className="rounded-xl border border-border bg-card p-3 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-foreground">
                <Icon className="h-4 w-4 text-primary" />
                {label}
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <CardHeader className="space-y-4 pb-0 text-center lg:text-left">
          <div className="flex flex-col items-center gap-3 lg:hidden">
            <BrandMark size="lg" brand={brand} />
            <div>
              <CardTitle className="text-2xl">{brand.appName}</CardTitle>
              <CardDescription>{brand.tagline}</CardDescription>
            </div>
          </div>
          <div className="space-y-1">
            <CardTitle className="text-xl">
              {mfaRequired ? 'Two-factor authentication' : 'Sign in'}
            </CardTitle>
            <CardDescription>
              {mfaRequired
                ? `Enter the 6-digit code from your authenticator app for ${mfaEmail}`
                : 'Welcome back — enter your credentials'}
            </CardDescription>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div
              role="alert"
              className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          )}

          {mfaRequired ? (
            <form onSubmit={handleMfaSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="mfaToken">Verification code</Label>
                <Input
                  id="mfaToken"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  required
                  value={mfaToken}
                  onChange={(e) => {
                    setMfaToken(e.target.value.replace(/\s/g, ''))
                    if (error) setError(null)
                  }}
                  className="text-center text-lg tracking-widest"
                  placeholder="000000"
                  maxLength={8}
                />
                <p className="text-xs text-muted-foreground">
                  You can also use a one-time backup code.
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={submitting || mfaToken.length < 4}
              >
                {submitting ? 'Verifying…' : 'Verify and sign in'}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setMfaRequired(false)
                  setMfaChallenge('')
                  setMfaToken('')
                }}
              >
                ← Back to sign in
              </Button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (error) setError(null)
                  }}
                  placeholder="you@company.com"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (error) setError(null)
                    }}
                    className="pr-10"
                    placeholder="••••••••"
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

              <div className="flex items-center gap-2">
                <Checkbox
                  id="rememberMe"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="rememberMe" className="cursor-pointer text-sm text-muted-foreground">
                  Remember me for 30 days
                </Label>
              </div>

              {recaptcha.active && recaptcha.isV2 && (
                <div ref={recaptcha.v2ContainerRef} className="flex justify-center" />
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={submitting || (recaptcha.active && !recaptcha.ready)}
              >
                {submitting ? 'Signing in…' : 'Sign in'}
              </Button>

              {recaptcha.active && (
                <div className="pt-1">
                  <RecaptchaNotice />
                </div>
              )}

              <div className="relative my-4">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <span className="relative flex justify-center bg-card px-2 text-xs text-muted-foreground">
                  or
                </span>
              </div>

              <Button type="button" variant="outline" className="w-full" asChild>
                <a href="/api/auth/oauth/google">Continue with Google</a>
              </Button>
            </form>
          )}

          <p className="text-center text-sm text-muted-foreground">
            No account?{' '}
            <Link href="/register" className="font-medium text-primary hover:text-primary/80">
              Create one
            </Link>
          </p>
          <p className="text-center text-sm">
            <Link href="/" className="text-muted-foreground hover:text-foreground">
              ← Back to home
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 text-foreground">
      <Suspense
        fallback={
          <Card className="w-full max-w-md border-border bg-card">
            <CardContent className="py-8 text-center text-muted-foreground">Loading…</CardContent>
          </Card>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
