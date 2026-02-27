import axios from 'axios'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_LICENSE_API_URL || '/api'

const api = axios.create({
  baseURL: API_BASE,
  headers: { 'Content-Type': 'application/json' },
})

api.interceptors.request.use((config) => {
  const { accessToken } = useAuthStore.getState()
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`
  }
  return config
})

const AUTH_ENDPOINTS_401_OK = ['/auth/login/', '/auth/token/refresh/']

function isAuthCredentialRequest(config: { url?: string; baseURL?: string }): boolean {
  const url = (config.url ?? '').toString()
  const baseURL = (config.baseURL ?? '').toString()
  const fullPath = url.startsWith('http') ? new URL(url).pathname : (baseURL.replace(/^https?:\/\/[^/]+/, '') + url).replace(/\/\/+/g, '/')
  return AUTH_ENDPOINTS_401_OK.some((endpoint) => fullPath.endsWith(endpoint) || fullPath.includes(endpoint))
}

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config
    const status = err.response?.status

    if (isAuthCredentialRequest(orig)) {
      return Promise.reject(err)
    }

    if (status === 403) {
      toast.error('You do not have permission to perform this action.')
    }

    if (status === 401 && !orig._retry) {
      orig._retry = true
      const { refreshToken, logout } = useAuthStore.getState()
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_BASE}/auth/token/refresh/`, { refresh: refreshToken })
          const access = res.data.access
          useAuthStore.getState().setAuth(useAuthStore.getState().user!, access, refreshToken)
          orig.headers.Authorization = `Bearer ${access}`
          return api(orig)
        } catch {
          logout()
          window.location.href = '/login'
        }
      } else {
        logout()
        window.location.href = '/login'
      }
    }
    return Promise.reject(err)
  }
)

export default api
