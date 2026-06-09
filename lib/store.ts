import { create } from 'zustand'
import type { User, UserRole } from './types'
import type { TenantMemberRole } from './tenant'
import type { Permission } from './platform/permissions'

interface AppState {
  currentUser: User | null
  currentRole: UserRole
  memberRole: TenantMemberRole | null
  tenantSlug: string | null
  rolePermissions: Permission[] | null
  enabledModuleIds: string[]
  modulesLoaded: boolean
  sidebarOpen: boolean
  navSearchQuery: string
  setCurrentUser: (user: User | null) => void
  setCurrentRole: (role: UserRole) => void
  setMemberRole: (role: TenantMemberRole | null) => void
  setTenantSlug: (slug: string | null) => void
  setRolePermissions: (perms: Permission[] | null) => void
  setEnabledModuleIds: (ids: string[]) => void
  setModulesLoaded: (loaded: boolean) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setNavSearchQuery: (query: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  currentRole: 'user',
  memberRole: null,
  tenantSlug: null,
  rolePermissions: null,
  enabledModuleIds: ['platform'],
  modulesLoaded: false,
  sidebarOpen: false,
  navSearchQuery: '',
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentRole: (role) => set({ currentRole: role }),
  setMemberRole: (role) => set({ memberRole: role }),
  setTenantSlug: (slug) => set({ tenantSlug: slug }),
  setRolePermissions: (perms) => set({ rolePermissions: perms }),
  setEnabledModuleIds: (ids) => set({ enabledModuleIds: ids, modulesLoaded: true }),
  setModulesLoaded: (loaded) => set({ modulesLoaded: loaded }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setNavSearchQuery: (query) => set({ navSearchQuery: query }),
}))
