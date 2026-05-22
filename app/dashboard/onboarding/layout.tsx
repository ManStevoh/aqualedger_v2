import Link from 'next/link'
import { Fish } from 'lucide-react'
import { APP_NAME } from '@/lib/constants'

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[calc(100vh-4.25rem)] bg-background">
      <div className="mx-auto flex max-w-3xl flex-col px-4 py-8 sm:px-6 lg:py-12">
        <Link
          href="/dashboard"
          className="mb-8 inline-flex items-center gap-2.5 font-semibold text-foreground"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <Fish className="h-5 w-5" />
          </span>
          {APP_NAME}
        </Link>
        {children}
      </div>
    </div>
  )
}
