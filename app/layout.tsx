import type { Metadata } from 'next'
import { Geist_Mono, Plus_Jakarta_Sans } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from '@/components/ui/sonner'
import { ThemeProvider } from '@/components/providers/theme-provider'
import { ServiceWorkerRegister } from '@/components/service-worker-register'
import { APP_NAME, APP_TAGLINE } from '@/lib/constants'
import './globals.css'

const sans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-sans-app',
  display: 'swap',
})
const mono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-mono-app',
  display: 'swap',
})

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover' as const,
}

export const metadata: Metadata = {
  title: {
    default: APP_NAME,
    template: `%s | ${APP_NAME}`,
  },
  description: APP_TAGLINE,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    title: APP_NAME,
  },
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${sans.variable} ${mono.variable}`}>
      <body className="font-sans antialiased min-h-dvh overflow-x-hidden">
        <ThemeProvider>
          {children}
          <Toaster
            richColors
            position="top-center"
            toastOptions={{
              classNames: {
                toast: 'glass-panel shadow-lg',
              },
            }}
          />
        </ThemeProvider>
        {process.env.NODE_ENV === 'production' && <ServiceWorkerRegister />}
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
