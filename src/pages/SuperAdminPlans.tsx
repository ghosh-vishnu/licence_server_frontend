import { useState, useEffect } from 'react'
import { companiesAPI, Plan } from '../api/companies'
import toast from 'react-hot-toast'

function TableSkeleton() {
  return (
    <div className="space-y-4 p-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-6">
          <div className="admin-skeleton h-4 flex-[2]" />
          <div className="admin-skeleton h-4 flex-1" />
          <div className="admin-skeleton h-4 flex-1" />
          <div className="admin-skeleton h-4 flex-1" />
          <div className="admin-skeleton h-4 w-14" />
        </div>
      ))}
    </div>
  )
}

export default function SuperAdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    companiesAPI.getPlans()
      .then((p) => setPlans(Array.isArray(p) ? p : []))
      .catch((e: any) => toast.error(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Plans</h1>
        <p className="text-sm text-gray-500 mt-0.5">Subscription plans available for companies</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <TableSkeleton />
        ) : plans.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-400">No plans configured yet.</p>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Max Users</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Max Spreadsheets</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Max Storage</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{p.max_users}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{p.max_spreadsheets}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{p.max_storage_mb} MB</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${
                      p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
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
