import api from './axios'

export interface AuditLogEntry {
  id: string
  action: string
  company_id: string | null
  license_jti: string | null
  metadata: Record<string, unknown>
  ip_address: string | null
  created_at: string
}

export const auditAPI = {
  list: (params?: { limit?: number }) =>
    api.get<AuditLogEntry[]>('/audit-log/', { params }).then((r) => (Array.isArray(r.data) ? r.data : [])),
}
