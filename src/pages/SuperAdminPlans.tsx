import { useState, useEffect } from 'react'
import { companiesAPI, Plan } from '../api/companies'
import toast from 'react-hot-toast'

export default function SuperAdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    companiesAPI.getPlans()
      .then((p) => setPlans(Array.isArray(p) ? p : []))
      .catch((e: any) => toast.error(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  if (loading) return <p className="text-gray-500">Loading...</p>

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Plans</h1>
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Users</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Spreadsheets</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Max Storage (MB)</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Active</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {plans.map((p) => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{p.name}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.max_users}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.max_spreadsheets}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{p.max_storage_mb}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-0.5 rounded text-xs font-medium ${p.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {p.is_active ? 'Yes' : 'No'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {plans.length === 0 && <p className="px-4 py-8 text-center text-gray-500">No plans.</p>}
      </div>
    </div>
  )
}
