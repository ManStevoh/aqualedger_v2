'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  CheckCircle2,
  XCircle,
  Database,
  Key,
  Play,
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Terminal,
  Server,
  Layers,
  AlertTriangle,
} from 'lucide-react'

interface SetupResponse {
  success: boolean
  timestamp?: string
  database?: string
  schemaApplied?: boolean
  superAdminStatus?: string
  summary?: {
    totalMigrations: number
    applied: number
    skipped: number
    failed: number
  }
  migrations?: Array<{
    file: string
    status: 'applied' | 'skipped' | 'failed'
    detail?: string
  }>
  logs?: string[]
  adminCredentials?: {
    email: string
    password: string
  }
  error?: string
  hint?: string
}

function SetupContent() {
  const searchParams = useSearchParams()
  const [secretKey, setSecretKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SetupResponse | null>(null)
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    const keyFromUrl = searchParams.get('key') || searchParams.get('secret') || '1987'
    setSecretKey(keyFromUrl)
  }, [searchParams])

  const runSetup = async (keyToUse?: string) => {
    const passkey = keyToUse || secretKey || '1987'
    setLoading(true)
    setErrorMsg('')
    setResult(null)

    try {
      const res = await fetch(`/api/setup?key=${encodeURIComponent(passkey)}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key: passkey }),
      })

      const data = await res.json()
      if (!res.ok && !data.logs) {
        setErrorMsg(data.error || 'Failed to complete setup.')
      }
      setResult(data)
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Network error during setup call.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4 md:p-8">
      {/* Background Decorator */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/30 via-slate-950 to-slate-950 pointer-events-none" />

      <div className="relative z-10 w-full max-w-4xl space-y-6">
        {/* Header Card */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-4">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
                <Database className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white">
                  AquaLedger Database & Migration Installer
                </h1>
                <p className="text-sm text-slate-400">
                  Automated web setup for cPanel hosting without terminal access
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-lg border border-slate-700/60 text-xs font-medium text-slate-300">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              Secret Key Protected
            </div>
          </div>

          {/* Key Input & Trigger */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 pt-2">
            <div className="md:col-span-3 relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Key className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={secretKey}
                onChange={(e) => setSecretKey(e.target.value)}
                placeholder="Enter Setup Passkey (default: 1987)"
                className="w-full pl-10 pr-4 py-3 bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm font-mono"
              />
            </div>
            <button
              onClick={() => runSetup()}
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 disabled:opacity-50 text-white font-semibold rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition-all text-sm"
            >
              {loading ? (
                <>
                  <RefreshCw className="h-4 w-4 animate-spin" />
                  Running Setup...
                </>
              ) : (
                <>
                  <Play className="h-4 w-4 fill-current" />
                  Run Setup & Migrations
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Error Banner */}
        {errorMsg && (
          <div className="bg-red-950/70 border border-red-800/60 rounded-xl p-4 flex items-start gap-3 text-red-200 text-sm">
            <XCircle className="h-5 w-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-semibold text-red-300">Setup Execution Error:</span> {errorMsg}
            </div>
          </div>
        )}

        {/* Results Dashboard */}
        {result && (
          <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-6 md:p-8 shadow-2xl space-y-6">
            {/* Status Summary Banner */}
            <div
              className={`p-4 rounded-xl border flex items-center justify-between gap-4 ${
                result.success
                  ? 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
                  : 'bg-amber-950/40 border-amber-800/60 text-amber-200'
              }`}
            >
              <div className="flex items-center gap-3">
                {result.success ? (
                  <CheckCircle2 className="h-6 w-6 text-emerald-400 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="h-6 w-6 text-amber-400 flex-shrink-0" />
                )}
                <div>
                  <h3 className="font-bold text-base">
                    {result.success
                      ? 'Database Setup & Migrations Completed Successfully!'
                      : 'Database Setup Completed with Warnings'}
                  </h3>
                  <p className="text-xs opacity-80">
                    Database: <code className="bg-black/30 px-1.5 py-0.5 rounded">{result.database}</code> | Timestamp: {result.timestamp}
                  </p>
                </div>
              </div>

              {result.adminCredentials && (
                <Link
                  href="/login"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-medium rounded-lg text-xs flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all flex-shrink-0"
                >
                  Proceed to Login <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </div>

            {/* Quick Metrics Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                  <Server className="h-3.5 w-3.5 text-blue-400" /> Target Database
                </div>
                <div className="text-lg font-semibold text-slate-100 mt-1 font-mono truncate">
                  {result.database || 'N/A'}
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                  <Layers className="h-3.5 w-3.5 text-emerald-400" /> Applied Migrations
                </div>
                <div className="text-lg font-semibold text-emerald-400 mt-1 font-mono">
                  {result.summary?.applied ?? 0} / {result.summary?.totalMigrations ?? 0}
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                  <RefreshCw className="h-3.5 w-3.5 text-slate-400" /> Skipped (Applied)
                </div>
                <div className="text-lg font-semibold text-slate-300 mt-1 font-mono">
                  {result.summary?.skipped ?? 0}
                </div>
              </div>

              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <div className="text-slate-400 text-xs font-medium flex items-center gap-1.5">
                  <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" /> Super Admin Status
                </div>
                <div className="text-lg font-semibold text-cyan-300 mt-1 font-mono capitalize">
                  {result.superAdminStatus?.replace('_', ' ') || 'Ready'}
                </div>
              </div>
            </div>

            {/* Admin Credentials Card */}
            {result.adminCredentials && (
              <div className="bg-slate-950/80 border border-blue-900/50 rounded-xl p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold uppercase tracking-wider text-blue-400">
                    Platform Super Admin Credentials
                  </span>
                  <div className="flex flex-wrap items-center gap-4 text-sm font-mono text-slate-200">
                    <div>
                      <span className="text-slate-400">Email:</span> {result.adminCredentials.email}
                    </div>
                    <div>
                      <span className="text-slate-400">Password:</span> {result.adminCredentials.password}
                    </div>
                  </div>
                </div>

                <Link
                  href="/login"
                  className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl text-sm flex items-center gap-2 shadow-lg shadow-blue-500/20 transition-all"
                >
                  Go to Login Screen <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            )}

            {/* Execution Log Terminal */}
            {result.logs && result.logs.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-slate-400" /> Setup Execution Log Output
                  </span>
                  <span className="text-xs text-slate-500 font-mono">
                    {result.logs.length} events logged
                  </span>
                </div>
                <div className="bg-black/80 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 max-h-60 overflow-y-auto space-y-1.5 leading-relaxed">
                  {result.logs.map((log, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="text-slate-600 select-none">&gt;</span>
                      <span
                        className={
                          log.includes('Error') || log.includes('error')
                            ? 'text-amber-400'
                            : log.includes('applied') || log.includes('Created') || log.includes('confirmed')
                            ? 'text-emerald-400'
                            : 'text-slate-300'
                        }
                      >
                        {log}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="text-center text-xs text-slate-500 space-y-1">
          <p>AquaLedger Enterprise Platform &bull; cPanel Zero-Terminal Migration Utility</p>
          <p>Default Access Secret: <code className="bg-slate-900 px-1 py-0.5 rounded text-slate-400">1987</code></p>
        </div>
      </div>
    </div>
  )
}

export default function SetupPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4">
          <div className="flex items-center gap-3 text-slate-400 text-sm">
            <RefreshCw className="h-5 w-5 animate-spin text-blue-500" />
            Loading Setup Assistant...
          </div>
        </div>
      }
    >
      <SetupContent />
    </Suspense>
  )
}
