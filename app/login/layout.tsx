import { PlatformBrandProvider } from '@/components/branding/platform-brand-provider'

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return <PlatformBrandProvider>{children}</PlatformBrandProvider>
}
