import api from './axios'

export interface SoftwareLicense {
  id: number
  company: string
  company_id: string
  company_name: string
  license_key: string
  product_name: string
  total_user_access: number
  purchase_date: string | null
  expiration_date: string | null
  status: string
  created_at: string
  module_access?: Record<string, string[]>
  role_limits?: RoleLimits
  location?: string | null
  description?: string | null
}

export interface RoleLimits {
  max_super_admins: number
  max_company_admins: number
  max_users: number
}

export interface CreateSoftwareLicenseData {
  company: string
  license_key?: string
  product_name?: string
  purchase_date?: string
  expiration_date?: string
  total_user_access?: number
  location?: string
  description?: string
  module_access?: Record<string, string[]>
  role_limits?: RoleLimits
  status?: string
}

export const licensesAPI = {
  list: (params?: { page?: number; page_size?: number }) =>
    api
      .get<{ results?: SoftwareLicense[] }>('/subscriptions/licenses/', { params })
      .then((r) => r.data.results ?? r.data ?? []),
  get: (id: number) => api.get<SoftwareLicense>(`/subscriptions/licenses/${id}/`).then((r) => r.data),
  create: (data: CreateSoftwareLicenseData) =>
    api.post<SoftwareLicense>('/subscriptions/licenses/', data).then((r) => r.data),
  update: (id: number, data: Partial<CreateSoftwareLicenseData>) =>
    api.patch<SoftwareLicense>(`/subscriptions/licenses/${id}/`, data).then((r) => r.data),
  delete: (id: number) => api.delete(`/subscriptions/licenses/${id}/`),
  activate: (id: number) => api.post<{ status: string }>(`/subscriptions/licenses/${id}/activate/`).then((r) => r.data),
  disable: (id: number) => api.post<{ status: string }>(`/subscriptions/licenses/${id}/disable/`).then((r) => r.data),
  extend: (id: number, data?: { extend_days?: number; expiration_date?: string }) =>
    api.post<SoftwareLicense>(`/subscriptions/licenses/${id}/extend/`, data ?? {}).then((r) => r.data),
}
