import { create } from 'zustand'
import type { User, UserRole } from './types'

interface AppState {
  currentUser: User | null
  currentRole: UserRole
  enabledModuleIds: string[]
  modulesLoaded: boolean
  sidebarOpen: boolean
  navSearchQuery: string
  setCurrentUser: (user: User | null) => void
  setCurrentRole: (role: UserRole) => void
  setEnabledModuleIds: (ids: string[]) => void
  setModulesLoaded: (loaded: boolean) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
  setNavSearchQuery: (query: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  currentRole: 'fisherman',
  enabledModuleIds: ['platform'],
  modulesLoaded: false,
  sidebarOpen: true,
  navSearchQuery: '',
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentRole: (role) => set({ currentRole: role }),
  setEnabledModuleIds: (ids) => set({ enabledModuleIds: ids, modulesLoaded: true }),
  setModulesLoaded: (loaded) => set({ modulesLoaded: loaded }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setNavSearchQuery: (query) => set({ navSearchQuery: query }),
}))
