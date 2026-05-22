'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { HeroDashboardPreview } from '@/components/marketing/hero-dashboard-preview'
import { LandingNav } from '@/components/marketing/landing-nav'
import {
  ArrowRight,
  Bot,
  CheckCircle2,
  CloudRain,
  Fish,
  Globe2,
  Lock,
  ShieldCheck,
  Sparkles,
} from 'lucide-react'
import Link from 'next/link'
import { PlatformBrandProvider } from '@/components/branding/platform-brand-provider'
import { APP_NAME, APP_TAGLINE, APP_VERSION } from '@/lib/constants'
import { ERP_MODULES } from '@/lib/platform/modules'

const HERO_BULLETS = [
  'Fleet, trips, and catch-to-cash traceability',
  'Cold chain monitoring with HACCP workflows',
  'Finance, procurement, HR payroll, and analytics',
  'M-Pesa, SMS, and multi-tenant coastal operations',
] as const

const TRUST_ITEMS = [
  { icon: ShieldCheck, label: 'HACCP & audit trails' },
  { icon: Lock, label: 'Role-based access' },
  { icon: Globe2, label: 'Built for African fisheries' },
  { icon: Fish, label: '16 integrated modules' },
] as const

const AI_CAPABILITIES = [
  {
    title: 'Predictive operations',
    description:
      'Demand, species pricing, and inventory days-of-stock from your live orders and catch data.',
  },
  {
    title: 'Risk intelligence',
    description:
      'Wallet anomaly detection and cold-chain reviews correlated with alerts and telemetry.',
  },
  {
    title: 'Executive AI briefs',
    description:
      'Daily prioritized actions synthesized from ERP KPIs — orders, pipeline, finance, and ops.',
  },
  {
    title: 'Augmented reporting',
    description:
      'IFRS and operations reports with optional AI executive narrative in scheduled email delivery.',
  },
  {
    title: 'Grounded copilot',
    description:
      'Chat answers grounded in your orders, catch, general ledger, CRM pipeline, and alerts.',
  },
  {
    title: 'Automated refresh',
    description:
      'Cron or one-click regeneration of forecasts, risk scans, and business briefs per tenant.',
  },
] as const

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
    color: 'from-sky-500 to-cyan-600',
    href: '/dashboard/climate',
  },
]

function HomePageContent() {
  return (
    <div className="min-h-screen bg-background text-foreground antialiased">
      <LandingNav />

      {/* Hero — split enterprise layout */}
      <section className="border-b border-border bg-gradient-to-b from-slate-50/80 to-background px-4 py-16 sm:px-6 sm:py-20 lg:px-8 lg:py-24">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div className="max-w-xl lg:max-w-none">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-muted-foreground shadow-sm">
              <Fish className="h-4 w-4 text-primary" />
              <span>
                Maritime ERP · v{APP_VERSION}
              </span>
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem] lg:leading-[1.1]">
              Run catch-to-cash on one{' '}
              <span className="text-primary">maritime ERP</span>
            </h1>

            <p className="mt-5 text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {APP_TAGLINE}. {APP_NAME} unifies fleet operations, cold chain compliance,
              commerce, finance, and coastal governance for fisheries enterprises.
            </p>

            <ul className="mt-8 space-y-3">
              {HERO_BULLETS.map((item) => (
                <li key={item} className="flex gap-3 text-sm text-foreground sm:text-base">
                  <CheckCircle2
                    className="mt-0.5 h-5 w-5 shrink-0 text-primary"
                    aria-hidden
                  />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Link href="/register">
                <Button size="lg" className="gap-2 shadow-md">
                  Start free trial
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline">
                  Sign in
                </Button>
              </Link>
            </div>

            <div
              id="trust"
              className="mt-10 flex flex-wrap gap-x-6 gap-y-3 border-t border-border pt-8"
            >
              {TRUST_ITEMS.map((item) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.label}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Icon className="h-4 w-4 shrink-0 text-primary" aria-hidden />
                    <span>{item.label}</span>
                  </div>
                )
              })}
            </div>
          </div>

          <HeroDashboardPreview className="mx-auto w-full max-w-lg lg:max-w-none" />
        </div>
      </section>

      {/* Module grid */}
      <section
        id="modules"
        className="scroll-mt-20 border-b border-border px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Product
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Sixteen integrated modules
            </h2>
            <p className="mt-3 text-lg text-muted-foreground">
              Every domain your fisheries enterprise needs — role-based access, tenant-scoped
              data, and REST APIs throughout.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {LANDING_MODULES.map((mod) => {
              const Icon = mod.icon
              return (
                <Link key={mod.id} href={mod.href}>
                  <Card className="h-full border-border transition-all hover:border-primary/30 hover:shadow-md">
                    <CardHeader className="pb-2">
                      <div
                        className={`mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br ${mod.color}`}
                      >
                        <Icon className="h-5 w-5 text-white" />
                      </div>
                      <CardTitle className="text-base">{mod.label}</CardTitle>
                      <CardDescription>{mod.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
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

      {/* AI-powered operations — honest positioning for sales / RFP */}
      <section
        id="ai"
        className="scroll-mt-20 border-b border-border px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto max-w-7xl">
          <div className="mb-12 max-w-3xl">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Intelligence
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              AI-powered fisheries operations
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              Statistical models and rule-based briefs run on your tenant data out of the box.
              Add <code className="rounded bg-muted px-1.5 py-0.5 text-sm font-mono">OPENAI_API_KEY</code>{' '}
              for natural-language executive narratives, report augmentation, and a fully grounded
              copilot — without changing your core ERP workflows.
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {AI_CAPABILITIES.map((cap) => (
              <Card key={cap.title} className="border-border">
                <CardHeader className="pb-2">
                  <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500 to-pink-600">
                    <Sparkles className="h-4 w-4 text-white" aria-hidden />
                  </div>
                  <CardTitle className="text-base">{cap.title}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {cap.description}
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>

          <div className="mt-10 grid gap-4 lg:grid-cols-2">
            <Card className="border-border bg-muted/30">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Bot className="h-4 w-4 text-primary" />
                  Without an LLM API key
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Position honestly as <strong className="text-foreground">AI-assisted analytics</strong>:
                moving-average demand, linear price signals, z-score wallet checks, reorder urgency,
                and rule-based daily briefs — all from live SQL on your books.
              </CardContent>
            </Card>
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-2">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Sparkles className="h-4 w-4 text-primary" />
                  With OpenAI configured
                </CardTitle>
              </CardHeader>
              <CardContent className="text-sm text-muted-foreground leading-relaxed">
                Upgrade messaging to <strong className="text-foreground">AI-enabled vertical ERP</strong>:
                LLM business briefs, executive report narratives, and conversational assistant
                answers scoped to aggregated tenant metrics (no raw PII dumps).
              </CardContent>
            </Card>
          </div>

          <p className="mt-6 rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-center text-xs text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            <strong className="text-foreground">Phase 5 (not in this pass):</strong> document RAG,
            agent actions from chat, per-tenant AI usage billing, and custom ML models.{' '}
            <span className="whitespace-nowrap">Guide: docs/AI_ENABLEMENT.md</span>
          </p>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Explore in product after sign-in:{' '}
            <Link href="/dashboard/ai" className="font-medium text-primary hover:underline">
              AI Command Center
            </Link>
            {' · '}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </div>
      </section>

      {/* Industries / vision */}
      <section
        id="industries"
        className="scroll-mt-20 border-b border-border bg-muted/30 px-4 py-20 sm:px-6 lg:px-8"
      >
        <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
          <div id="vision">
            <p className="text-sm font-semibold uppercase tracking-wider text-primary">
              Industries
            </p>
            <h2 className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
              Digital infrastructure for sustainable fisheries
            </h2>
            <p className="mt-4 text-lg leading-relaxed text-muted-foreground">
              {APP_NAME} connects boat owners, fishermen, buyers, and BMU officials on one
              auditable platform. Trace every kilogram from catch to cold storage to sale.
              Automate compliance, reduce post-harvest loss, and unlock finance with verified
              data.
            </p>
            <ul className="mt-8 space-y-3 text-muted-foreground">
              {[
                'Multi-tenant SaaS with branch-level operations',
                'IoT-ready cold chain with HACCP checklists',
                'M-Pesa, SMS, and webhook integrations',
                'Executive analytics and scheduled reporting',
              ].map((item) => (
                <li key={item} className="flex gap-3">
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <Card className="border-border shadow-sm">
            <CardHeader>
              <CardTitle>Built for the full value chain</CardTitle>
              <CardDescription>
                From landing site to ledger — no spreadsheets required
              </CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3 text-sm">
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
                  className="rounded-lg border border-border bg-background px-3 py-2.5 font-medium text-foreground"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-card px-6 py-12 text-center shadow-sm sm:px-10">
          <h2 className="text-3xl font-bold tracking-tight">
            Ready to run your fisheries enterprise?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Create an account to access your command center, live KPIs, and role-based modules.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/register">
              <Button size="lg">Start free trial</Button>
            </Link>
            <Link href="/login">
              <Button size="lg" variant="outline">
                Sign in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      <footer className="border-t border-border px-4 py-8 text-center text-sm text-muted-foreground">
        {APP_NAME} · {APP_TAGLINE} © {new Date().getFullYear()}
      </footer>
    </div>
  )
}

export default function HomePage() {
  return (
    <PlatformBrandProvider>
      <HomePageContent />
    </PlatformBrandProvider>
  )
}
