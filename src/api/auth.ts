import api from './axios'

export interface AuthResponse {
  user: { username: string; is_staff: boolean }
  access: string
  refresh: string
}

export const authAPI = {
  login: async (username: string, password: string): Promise<AuthResponse> => {
    const { data } = await api.post<AuthResponse>('/auth/login/', { username, password })
    return data
  },
  refresh: async (refresh: string) => {
    const { data } = await api.post('/auth/token/refresh/', { refresh })
    return data
  },
}
