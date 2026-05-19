import { create } from 'zustand'
import type { User, UserRole } from './types'

interface AppState {
  currentUser: User | null
  currentRole: UserRole
  sidebarOpen: boolean
  setCurrentUser: (user: User | null) => void
  setCurrentRole: (role: UserRole) => void
  setSidebarOpen: (open: boolean) => void
  toggleSidebar: () => void
}

export const useAppStore = create<AppState>((set) => ({
  currentUser: null,
  currentRole: 'fisherman',
  sidebarOpen: true,
  setCurrentUser: (user) => set({ currentUser: user }),
  setCurrentRole: (role) => set({ currentRole: role }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}))
