import { useState, useEffect } from 'react'
import { auditAPI, AuditLogEntry } from '../api/audit'
import toast from 'react-hot-toast'

const ACTION_LABELS: Record<string, string> = {
  create: 'License Created',
  revoke: 'License Revoked',
  verify: 'License Verified',
  expire: 'License Expired',
  generate_token: 'Token Generated',
  key_rotated: 'Key Rotated',
}

export default function SuperAdminTransactions() {
  const [logs, setLogs] = useState<AuditLogEntry[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    auditAPI.list({ limit: 100 })
      .then(setLogs)
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Transactions</h1>
        <p className="text-sm text-gray-500 mt-0.5">License activity and audit log</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-6 space-y-3">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="admin-skeleton h-12 rounded" />
            ))}
          </div>
        ) : logs.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-400">No activity recorded yet.</p>
            <p className="text-xs text-gray-400 mt-1">License creation and token generation will appear here.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Details</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50">
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {new Date(log.created_at).toLocaleString()}
                  </td>
                  <td className="px-5 py-3">
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-indigo-50 text-indigo-700">
                      {ACTION_LABELS[log.action] ?? log.action}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600 font-mono">
                    {log.company_id ? log.company_id.slice(0, 8) + '…' : '—'}
                  </td>
                  <td className="px-5 py-3 text-sm text-gray-600">
                    {log.metadata?.display_key ? `Key: ${log.metadata.display_key}` : log.license_jti ? `JTI: ${log.license_jti}` : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
