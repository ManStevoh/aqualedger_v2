'use client'

import { useEffect, useState, use } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, User, Mail, Lock, Phone, ShieldAlert } from 'lucide-react'
import { toast } from 'sonner'
import { publicApiFetch } from '@/lib/client-api'
import type { CSSProperties } from 'react'

interface PageProps {
  params: Promise<{ slug: string }>
}

export default function StorefrontRegisterPage({ params }: PageProps) {
  const { slug } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect')

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [storeName, setStoreName] = useState('Fresh Market')
  const [cssVars, setCssVars] = useState<Record<string, string>>({})
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    publicApiFetch(`/api/v2/commerce/storefront?slug=${slug}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.success && data.data) {
          setStoreName(data.data.settings?.store_name || data.data.settings?.tenant_name || 'Seafood Store')
          if (data.data.cssVars) {
            setCssVars(data.data.cssVars)
          }
        }
      })
      .catch(() => {
        setStoreName(slug.charAt(0).toUpperCase() + slug.slice(1) + ' Store')
      })
  }, [slug])

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorMsg('')

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.')
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/public/store/${slug}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          lastName,
          email,
          phone: phone || undefined,
          password,
        }),
      })
      const data = await res.json()

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Registration failed')
      }

      toast.success('Registration successful!')
      if (redirect) {
        router.push(redirect)
      } else {
        router.push(`/store/${slug}`)
      }
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Registration failed')
      toast.error(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen flex flex-col justify-center items-center px-4 sm:px-6 lg:px-8 py-12"
      style={{
        ...cssVars,
        backgroundColor: 'var(--sf-bg, #f8fafc)',
        color: 'var(--sf-text, #0f172a)',
        fontFamily: 'var(--sf-font-body, inherit)',
      } as CSSProperties}
    >
      <div className="absolute top-6 left-6">
        <Link
          href={`/store/${slug}`}
          className="inline-flex items-center gap-2 text-sm font-semibold hover:text-[var(--sf-primary,#0ea5e9)] transition-colors duration-300"
        >
          <ArrowLeft className="h-4 w-4" /> Back to store
        </Link>
      </div>

      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-2xl border border-slate-100 shadow-xl transition-all duration-300 hover:shadow-2xl">
        <div className="text-center">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-[var(--sf-primary,#0ea5e9)]/10 text-[var(--sf-primary,#0ea5e9)] mb-4">
            <User className="h-6 w-6" />
          </div>
          <h2 className="text-3xl font-extrabold tracking-tight" style={{ fontFamily: 'var(--sf-font-heading, inherit)' }}>
            Create Account
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Sign up to buy fresh seafood from <strong>{storeName}</strong>
          </p>
        </div>

        {errorMsg && (
          <div className="flex gap-2.5 rounded-lg border border-red-100 bg-red-50/50 p-3.5 text-xs text-red-600 animate-in fade-in slide-in-from-top-1 duration-300">
            <ShieldAlert className="h-4 w-4 shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-red-700">Registration Error</span>
              <p className="mt-0.5">{errorMsg}</p>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-4" onSubmit={handleRegister}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold tracking-wider uppercase text-slate-500" htmlFor="firstName">
                First Name
              </label>
              <input
                id="firstName"
                type="text"
                required
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all duration-300 outline-none focus:border-[var(--sf-primary,#0ea5e9)] focus:bg-white focus:ring-2 focus:ring-[var(--sf-primary,#0ea5e9)]/15 min-h-[44px]"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div>
              <label className="text-xs font-bold tracking-wider uppercase text-slate-500" htmlFor="lastName">
                Last Name
              </label>
              <input
                id="lastName"
                type="text"
                required
                className="w-full mt-1 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm transition-all duration-300 outline-none focus:border-[var(--sf-primary,#0ea5e9)] focus:bg-white focus:ring-2 focus:ring-[var(--sf-primary,#0ea5e9)]/15 min-h-[44px]"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold tracking-wider uppercase text-slate-500" htmlFor="email">
              Email Address
            </label>
            <div className="relative mt-1">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                id="email"
                type="email"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm transition-all duration-300 outline-none focus:border-[var(--sf-primary,#0ea5e9)] focus:bg-white focus:ring-2 focus:ring-[var(--sf-primary,#0ea5e9)]/15 min-h-[44px]"
                placeholder="john.doe@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold tracking-wider uppercase text-slate-500" htmlFor="phone">
              Phone Number (Optional)
            </label>
            <div className="relative mt-1">
              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                id="phone"
                type="tel"
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm transition-all duration-300 outline-none focus:border-[var(--sf-primary,#0ea5e9)] focus:bg-white focus:ring-2 focus:ring-[var(--sf-primary,#0ea5e9)]/15 min-h-[44px]"
                placeholder="2547XXXXXXXX"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-bold tracking-wider uppercase text-slate-500" htmlFor="password">
              Password (Min 8 chars)
            </label>
            <div className="relative mt-1">
              <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4.5 w-4.5 text-slate-400" />
              <input
                id="password"
                type="password"
                required
                className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-11 pr-4 py-3 text-sm transition-all duration-300 outline-none focus:border-[var(--sf-primary,#0ea5e9)] focus:bg-white focus:ring-2 focus:ring-[var(--sf-primary,#0ea5e9)]/15 min-h-[44px]"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-[var(--sf-primary,#0ea5e9)] hover:opacity-95 text-white py-3.5 text-sm font-bold tracking-wider uppercase transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-50 min-h-[48px] cursor-pointer"
          >
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>
        </form>

        <div className="text-center text-sm text-slate-500 pt-2 border-t border-slate-100">
          <span>Already have an account? </span>
          <Link
            href={`/store/${slug}/login${redirect ? `?redirect=${encodeURIComponent(redirect)}` : ''}`}
            className="font-bold text-[var(--sf-primary,#0ea5e9)] hover:underline"
          >
            Sign In
          </Link>
        </div>
      </div>
    </div>
  )
}
