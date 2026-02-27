import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface User {
  username: string
  is_staff: boolean
}

interface AuthState {
  user: User | null
  accessToken: string | null
  refreshToken: string | null
  isAuthenticated: boolean
  setAuth: (user: User, access: string, refresh: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,
      setAuth: (user, accessToken, refreshToken) =>
        set({ user, accessToken, refreshToken, isAuthenticated: true }),
      logout: () => {
        set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false })
        try {
          sessionStorage.removeItem('license-admin-auth')
          localStorage.removeItem('license-admin-auth')
        } catch {
          /* no-op */
        }
      },
    }),
    { name: 'license-admin-auth', storage: createJSONStorage(() => sessionStorage) }
  )
)
