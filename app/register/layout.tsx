import { PlatformBrandProvider } from '@/components/branding/platform-brand-provider'

export default function RegisterLayout({ children }: { children: React.ReactNode }) {
  return <PlatformBrandProvider>{children}</PlatformBrandProvider>
}
