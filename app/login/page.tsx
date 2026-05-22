'use client'

import { Suspense, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { apiFetch } from '@/lib/client-api'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'
import { useRecaptcha } from '@/components/security/use-recaptcha'
import { RecaptchaNotice } from '@/components/security/recaptcha-notice'
import {
  Anchor,
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
  const router = useRouter()
  const searchParams = useSearchParams()
  const from = searchParams.get('from') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [mfaChallenge, setMfaChallenge] = useState('')
  const [mfaToken, setMfaToken] = useState('')
  const [mfaEmail, setMfaEmail] = useState('')
  const recaptcha = useRecaptcha('login')

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
      router.push(from.startsWith('/') ? from : '/dashboard')
      router.refresh()
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
      router.push(from.startsWith('/') ? from : '/dashboard')
      router.refresh()
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
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
            <Anchor className="h-6 w-6 text-white" />
          </div>
          <div>
            <p className="text-xl font-semibold tracking-tight text-white">{APP_NAME}</p>
            <p className="text-sm text-slate-400">{APP_TAGLINE}</p>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-white">
          Maritime commerce, simplified.
        </h1>
        <p className="mt-3 max-w-md text-slate-400">
          One platform for fishing operations, cold chain, marketplace, and finance — built for
          Africa&apos;s blue economy.
        </p>
        <div className="mt-8 grid grid-cols-2 gap-3">
          {ROLE_HINTS.map(({ icon: Icon, label, hint }) => (
            <div
              key={label}
              className="rounded-xl border border-white/10 bg-white/5 p-3 backdrop-blur-sm"
            >
              <div className="flex items-center gap-2 text-sm font-medium text-slate-200">
                <Icon className="h-4 w-4 text-cyan-400" />
                {label}
              </div>
              <p className="mt-1 text-xs text-slate-500">{hint}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-slate-950/70 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl">
        <div className="mb-6 text-center lg:hidden">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600">
            <Anchor className="h-7 w-7 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-white">{APP_NAME}</h2>
        </div>

        <div className="mb-6 space-y-1">
          <h2 className="text-xl font-semibold text-white">
            {mfaRequired ? 'Two-factor authentication' : 'Sign in'}
          </h2>
          <p className="text-sm text-slate-400">
            {mfaRequired
              ? `Enter the 6-digit code from your authenticator app for ${mfaEmail}`
              : 'Welcome back — enter your credentials'}
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200"
          >
            {error}
          </div>
        )}

        {mfaRequired ? (
          <form onSubmit={handleMfaSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mfaToken" className="text-slate-300">
                Verification code
              </Label>
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
                className="border-white/10 bg-slate-900/80 text-center text-lg tracking-widest text-white"
                placeholder="000000"
                maxLength={8}
              />
              <p className="text-xs text-slate-500">You can also use a one-time backup code.</p>
            </div>
            <Button
              type="submit"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500"
              disabled={submitting || mfaToken.length < 4}
            >
              {submitting ? 'Verifying…' : 'Verify and sign in'}
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full text-slate-400"
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
            <Label htmlFor="email" className="text-slate-300">
              Email
            </Label>
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
              className="border-white/10 bg-slate-900/80 text-white placeholder:text-slate-500"
              placeholder="you@company.com"
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
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  if (error) setError(null)
                }}
                className="border-white/10 bg-slate-900/80 pr-10 text-white placeholder:text-slate-500"
                placeholder="••••••••"
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

          <div className="flex items-center gap-2">
            <Checkbox
              id="rememberMe"
              checked={rememberMe}
              onCheckedChange={(checked) => setRememberMe(checked === true)}
            />
            <Label htmlFor="rememberMe" className="cursor-pointer text-sm text-slate-400">
              Remember me for 30 days
            </Label>
          </div>

          {recaptcha.active && recaptcha.isV2 && (
            <div ref={recaptcha.v2ContainerRef} className="flex justify-center" />
          )}

          <Button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-600 text-white hover:from-cyan-400 hover:to-blue-500"
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
              <span className="w-full border-t border-white/10" />
            </div>
            <span className="relative flex justify-center text-xs text-slate-500">or</span>
          </div>

          <Button type="button" variant="outline" className="w-full border-white/10 bg-slate-900/50" asChild>
            <a href="/api/auth/oauth/google">Continue with Google</a>
          </Button>
        </form>
        )}

        <p className="mt-6 text-center text-sm text-slate-400">
          No account?{' '}
          <Link href="/register" className="font-medium text-cyan-400 hover:text-cyan-300">
            Create one
          </Link>
        </p>
        <p className="mt-2 text-center text-sm">
          <Link href="/" className="text-slate-500 hover:text-slate-300">
            ← Back to home
          </Link>
        </p>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 p-4">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-32 top-0 h-96 w-96 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -right-32 bottom-0 h-96 w-96 rounded-full bg-blue-600/20 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>
      <Suspense
        fallback={
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-slate-950/70 p-8 text-center text-slate-400 backdrop-blur-xl">
            Loading…
          </div>
        }
      >
        <LoginForm />
      </Suspense>
    </div>
  )
}
