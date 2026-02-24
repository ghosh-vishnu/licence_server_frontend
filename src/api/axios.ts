import axios from 'axios'
import { useAuthStore } from '../store/authStore'

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

api.interceptors.response.use(
  (r) => r,
  async (err) => {
    const orig = err.config
    if (err.response?.status === 401 && !orig._retry) {
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
