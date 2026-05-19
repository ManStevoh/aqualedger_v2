'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowRight, BarChart3, Ship, Fish, TrendingUp, Users, Wallet } from 'lucide-react'
import Link from 'next/link'

export default function HomePage() {
  const features = [
    {
      icon: BarChart3,
      title: 'Financial Analytics',
      description: 'Real-time financial data, revenue tracking, and comprehensive expense management'
    },
    {
      icon: Wallet,
      title: 'Investment Portfolio',
      description: 'Track investments, monitor returns, and manage your fishing economy assets'
    },
    {
      icon: Ship,
      title: 'Fleet Management',
      description: 'Monitor boat operations, track fishing trips, and manage maintenance schedules'
    },
    {
      icon: Fish,
      title: 'Catch & Marketplace',
      description: 'Manage catches, list on marketplace, and trade with BMUs across the network'
    },
    {
      icon: Users,
      title: 'User Management',
      description: 'Admin tools for managing users, roles, and system-wide permissions'
    },
    {
      icon: TrendingUp,
      title: 'Market Intelligence',
      description: 'Track market trends, pricing analytics, and storage facility capacity'
    }
  ]

  const dashboards = [
    {
      name: 'Portfolio',
      description: 'Monitor investments and returns',
      href: '/dashboard/portfolio',
      color: 'bg-blue-50'
    },
    {
      name: 'Fleet',
      description: 'Manage boats and operations',
      href: '/dashboard/fleet',
      color: 'bg-green-50'
    },
    {
      name: 'Marketplace',
      description: 'Buy and sell fish',
      href: '/dashboard/marketplace',
      color: 'bg-purple-50'
    },
    {
      name: 'Analytics',
      description: 'Financial insights',
      href: '/dashboard/analytics',
      color: 'bg-orange-50'
    },
    {
      name: 'Admin',
      description: 'System management',
      href: '/dashboard/admin',
      color: 'bg-red-50'
    },
    {
      name: 'Wallet',
      description: 'Payment management',
      href: '/dashboard/wallet',
      color: 'bg-indigo-50'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Hero Section */}
      <div className="relative overflow-hidden px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
            AquaLedger V2
          </h1>
          <p className="mt-4 text-xl text-gray-300">
            Digital Investment Operating System for the Fishing Economy
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/login">
              <Button size="lg" className="gap-2">
                Sign in <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
            <Link href="/register">
              <Button size="lg" variant="secondary">
                Create account
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button size="lg" variant="outline" className="border-slate-600 text-white hover:bg-white/10">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Quick Access Dashboards */}
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12">Quick Access</h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {dashboards.map((dashboard) => (
              <Link key={dashboard.name} href={dashboard.href}>
                <Card className={`cursor-pointer hover:shadow-lg transition-shadow ${dashboard.color}`}>
                  <CardHeader>
                    <CardTitle className="text-lg">{dashboard.name}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground">{dashboard.description}</p>
                    <Button variant="link" className="mt-4 p-0 gap-2">
                      Access <ArrowRight className="w-4 h-4" />
                    </Button>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="px-4 py-16 sm:px-6 lg:px-8 bg-white/5">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12">Platform Features</h2>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => {
              const Icon = feature.icon
              return (
                <div key={feature.title} className="flex flex-col gap-3 p-6 bg-white/10 rounded-lg backdrop-blur border border-white/20">
                  <Icon className="w-8 h-8 text-blue-400" />
                  <h3 className="text-lg font-semibold text-white">{feature.title}</h3>
                  <p className="text-sm text-gray-300">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* System Capabilities */}
      <div className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-white mb-12">Complete System Coverage</h2>
          <div className="grid gap-8 md:grid-cols-2">
            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Operational Dashboards</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Main Dashboard with KPIs
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Fleet Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Fishing Trip Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Catch Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Maintenance Scheduling
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Financial & Market Systems</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Portfolio Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Marketplace Trading
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> BMU Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Cold Storage Tracking
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Financial Analytics
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">Admin & Control</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> User Management
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Role-Based Access
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Notification System
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> System Monitoring
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Activity Logs
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-slate-800 border-slate-700">
              <CardHeader>
                <CardTitle className="text-white">API Integration Ready</CardTitle>
              </CardHeader>
              <CardContent className="text-gray-300">
                <ul className="space-y-2">
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> 14+ API Routes
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> MySQL-backed REST APIs (v2)
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> SWR Integration
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> Type-Safe Operations
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="text-blue-400">✓</span> JWT sessions and role guards
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-20 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-white">Ready to Manage Your Fishing Economy?</h2>
          <p className="mt-4 text-lg text-blue-100">
            Access the AquaLedger V2 dashboards wired to your database—trips, marketplace, wallet, investments, and more.
          </p>
          <div className="mt-8 flex gap-4 justify-center">
            <Link href="/login">
              <Button size="lg" variant="secondary">
                Sign in to continue
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="px-4 py-8 sm:px-6 lg:px-8 border-t border-white/10">
        <div className="mx-auto max-w-6xl text-center text-gray-400 text-sm">
          <p>AquaLedger V2 - Digital Investment Operating System © 2024</p>
        </div>
      </div>
    </div>
  )
}
