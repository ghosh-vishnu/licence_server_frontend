import api from './axios'

export const settingsAPI = {
  get: () => api.get<Record<string, string>>('/settings/').then((r) => r.data),
  update: (data: Record<string, string>) => api.put('/settings/', data).then(() => ({ ok: true })),
}
