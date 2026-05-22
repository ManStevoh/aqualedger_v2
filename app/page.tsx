'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, CloudRain, Fish, Sparkles } from 'lucide-react'
import Link from 'next/link'
import { APP_NAME, APP_TAGLINE, APP_VERSION } from '@/lib/constants'
import { ERP_MODULES } from '@/lib/platform/modules'

const LANDING_MODULES = [
  ...ERP_MODULES.filter((m) => m.id !== 'platform').map((mod) => ({
    id: mod.id,
    label: mod.label,
    description: mod.description,
    icon: mod.icon,
    color: mod.color,
    href: mod.nav[0]?.href ?? '/dashboard',
  })),
  {
    id: 'climate',
    label: 'Climate Intelligence',
    description: 'Ocean conditions, weather alerts, and fishing advisories',
    icon: CloudRain,
    color: 'from-sky-400 to-cyan-600',
    href: '/dashboard/climate',
  },
]

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#070b12] text-white antialiased">
      {/* Hero */}
      <section className="relative overflow-hidden px-4 py-28 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_-10%,rgba(14,165,233,0.25),transparent)]" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/40 to-transparent" />
        <div className="relative mx-auto max-w-5xl text-center">
          <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-sm font-medium text-cyan-200/90 backdrop-blur-md">
            <Fish className="h-4 w-4 text-cyan-400" />
            <span>Maritime ERP · v{APP_VERSION}</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
            <span className="bg-gradient-to-r from-white via-cyan-100 to-cyan-400 bg-clip-text text-transparent">
              {APP_NAME}
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-slate-300 sm:text-xl">
            {APP_TAGLINE}. One platform for fleet operations, cold chain compliance,
            commerce, finance, and coastal community governance — built for African fisheries.
          </p>
          <p className="mx-auto mt-4 max-w-3xl text-base text-slate-400">
            AquaERP unifies catch-to-cash workflows: from landing site and traceability through
            inventory, procurement, and marketplace orders — with real-time cold chain monitoring,
            HR payroll, and executive analytics in a single command center.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="gap-2 bg-cyan-600 hover:bg-cyan-500">
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Sign in
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button
                size="lg"
                variant="outline"
                className="border-slate-600 text-white hover:bg-white/10"
              >
                Open dashboard
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 16-module feature grid */}
      <section className="border-t border-white/10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold">Sixteen integrated modules</h2>
            <p className="mt-3 text-slate-400">
              Every domain your fisheries enterprise needs — role-based access, tenant-scoped data,
              and REST APIs throughout.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LANDING_MODULES.map((mod) => {
              const Icon = mod.icon
              return (
                <Link key={mod.id} href={mod.href}>
                  <Card className="h-full border-white/10 bg-white/5 text-white backdrop-blur transition-all hover:border-cyan-500/40 hover:bg-white/10">
                    <CardHeader className="pb-2">
                      <div
                        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${mod.color}`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-base text-white">{mod.label}</CardTitle>
                      <CardDescription className="text-slate-400">
                        {mod.description}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="inline-flex items-center gap-1 text-sm text-cyan-400">
                        Explore <ArrowRight className="h-3.5 w-3.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Vision */}
      <section className="border-t border-white/10 bg-white/[0.02] px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="mb-4 inline-flex items-center gap-2 text-cyan-400">
              <Sparkles className="h-5 w-5" />
              <span className="text-sm font-medium uppercase tracking-wider">The AquaERP vision</span>
            </div>
            <h2 className="text-3xl font-bold">
              Digital infrastructure for sustainable fisheries
            </h2>
            <p className="mt-4 text-slate-300">
              AquaERP connects boat owners, fishermen, buyers, and BMU officials on one
              auditable platform. Trace every kilogram from catch to cold storage to sale.
              Automate compliance, reduce post-harvest loss, and unlock finance with verified data.
            </p>
            <ul className="mt-6 space-y-3 text-slate-400">
              <li className="flex gap-2">
                <span className="text-cyan-400">→</span>
                Multi-tenant SaaS with branch-level operations
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">→</span>
                IoT-ready cold chain with HACCP checklists
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">→</span>
                M-Pesa, SMS, and webhook integrations
              </li>
              <li className="flex gap-2">
                <span className="text-cyan-400">→</span>
                AI-assisted demand forecasting and insights
              </li>
            </ul>
          </div>
          <Card className="border-white/10 bg-slate-900/80 text-white">
            <CardHeader>
              <CardTitle>Built for the full value chain</CardTitle>
              <CardDescription className="text-slate-400">
                From landing site to ledger — no spreadsheets required
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-4 text-sm">
              {[
                'Fleet & trips',
                'Catch & auctions',
                'Marketplace',
                'Cold storage',
                'Procurement',
                'General ledger',
                'Payroll & HR',
                'Executive BI',
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-slate-300"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-white/10 px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold">Ready to run your fisheries enterprise?</h2>
          <p className="mt-4 text-lg text-slate-400">
            Create an account or sign in to access your command center, live KPIs, and
            role-based modules.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/register">
              <Button size="lg" className="bg-cyan-600 hover:bg-cyan-500">
                Register free
              </Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-white/10 px-4 py-8 text-center text-sm text-slate-500">
        {APP_NAME} · Maritime commerce & fisheries ERP © {new Date().getFullYear()}
      </footer>
    </div>
  )
}
