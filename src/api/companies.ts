import api from './axios'

export interface Plan {
  id: string
  name: string
  slug: string
  max_users: number
  max_spreadsheets: number
  max_storage_mb: number
  is_active: boolean
}

export interface Subscriber {
  id: string
  name: string
  company_code: string | null
  email: string | null
  phone?: string | null
  address?: string | null
  state?: string | null
  country?: string | null
  time_zone?: string
  tax_id?: string | null
  admin_email?: string | null
  plan: string
  plan_name: string
  status: string
  expiry: string
  created_at: string
}

export interface CreateSubscriber {
  name: string
  state?: string
  country?: string
  time_zone?: string
  address?: string
  tax_id?: string
  phone?: string
  email?: string
  admin_email?: string
  admin_password?: string
  admin_confirm_password?: string
  company_code?: string
  plan?: string
  status?: string
  expiry?: string
  notes?: string
}

export interface UpdateSubscriber {
  name?: string
  email?: string
  phone?: string
  address?: string
  state?: string
  country?: string
  time_zone?: string
  tax_id?: string
  admin_email?: string
  status?: string
  notes?: string
  settings?: Record<string, unknown>
}

export interface GenerateLicenseResponse {
  license_key: string
  company_name: string
  plan: string
  expiry: string
}

export interface DashboardStats {
  total_companies: number
  active_companies: number
  suspended_companies: number
  expiring_soon: number
}

export interface ProductModule {
  id: string
  name: string
  description?: string
  submodules: { id: string; name: string }[]
}

export const companiesAPI = {
  list: (params?: { page?: number; page_size?: number; search?: string; status?: string }) =>
    api.get<{ results?: Subscriber[]; count?: number }>('/companies/', { params }).then((r) => {
      const data = r.data
      return Array.isArray(data.results) ? data.results : (Array.isArray(data) ? data : [])
    }),
  get: (id: string, params?: { view?: 'minimal' }) =>
    api.get<Subscriber>(`/companies/${id}/`, { params }).then((r) => r.data),
  create: (data: CreateSubscriber) => api.post<Subscriber>('/companies/', data).then((r) => r.data),
  update: (id: string, data: UpdateSubscriber) =>
    api.patch<Subscriber>(`/companies/${id}/`, data).then((r) => r.data),
  delete: (id: string) => api.delete(`/companies/${id}/`),
  getPlans: () =>
    api.get<Plan[] | { results: Plan[] }>('/plans/').then((r) => {
      const d = r.data
      return Array.isArray(d?.results) ? d.results : (Array.isArray(d) ? d : [])
    }),
  generateLicense: (id: string) =>
    api.post<GenerateLicenseResponse>(`/companies/${id}/generate-license/`).then((r) => r.data),
  getDashboard: () => api.get<DashboardStats>('/companies/dashboard/').then((r) => r.data),
  getProductModules: () => api.get<ProductModule[]>('/companies/product-modules/').then((r) => r.data),
}
