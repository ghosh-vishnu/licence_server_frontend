import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { companiesAPI, DashboardStats, Subscriber } from '../api/companies'

function StatSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 space-y-3">
      <div className="admin-skeleton h-4 w-24" />
      <div className="admin-skeleton h-7 w-16" />
      <div className="admin-skeleton h-3 w-20" />
    </div>
  )
}

function TableSkeleton() {
  return (
    <div className="space-y-3 p-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-4">
          <div className="admin-skeleton h-4 flex-1" />
          <div className="admin-skeleton h-4 w-20" />
          <div className="admin-skeleton h-4 w-16" />
        </div>
      ))}
    </div>
  )
}

export default function SuperAdminHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [companies, setCompanies] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      companiesAPI.getDashboard(),
      companiesAPI.list(),
    ])
      .then(([s, c]) => {
        setStats(s)
        setCompanies(Array.isArray(c) ? c.slice(0, 5) : [])
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Overview of your license server</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {loading ? (
          [...Array(3)].map((_, i) => <StatSkeleton key={i} />)
        ) : (
          <>
            <Link to="/super-admin/company/all-company" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all group">
              <p className="text-sm text-gray-500">Total Companies</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">{stats ? `${stats.active_companies}/${stats.total_companies}` : '—'}</p>
              <p className="text-xs text-gray-400 mt-1">Active / Total</p>
            </Link>
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <p className="text-sm text-gray-500">Suspended</p>
              <p className="text-2xl font-bold text-red-600 mt-1">{stats?.suspended_companies ?? '—'}</p>
              <p className="text-xs text-gray-400 mt-1">Needs attention</p>
            </div>
            <Link to="/super-admin/company/user-license" className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-gray-300 transition-all">
              <p className="text-sm text-gray-500">Licenses</p>
              <p className="text-2xl font-bold text-green-600 mt-1">Manage</p>
              <p className="text-xs text-gray-400 mt-1">View all licenses</p>
            </Link>
          </>
        )}
      </div>

      {/* Recent Companies */}
      <div className="bg-white rounded-xl border border-gray-200">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800">Recent Companies</h2>
          <Link to="/super-admin/company/all-company" className="text-xs text-indigo-600 hover:text-indigo-700 font-medium">View all</Link>
        </div>
        {loading ? (
          <TableSkeleton />
        ) : companies.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-sm text-gray-400">No companies registered yet.</p>
            <Link to="/super-admin/company/all-company" className="text-sm text-indigo-600 hover:text-indigo-700 font-medium mt-2 inline-block">Add your first company</Link>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Code</th>
                <th className="px-5 py-2.5 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3 text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-5 py-3 text-sm text-gray-500">{c.company_code || '—'}</td>
                  <td className="px-5 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-0.5 rounded-md ${
                      c.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${c.status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {c.status}
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
