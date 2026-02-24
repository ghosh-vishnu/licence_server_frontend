import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { companiesAPI, DashboardStats } from '../api/companies'

export default function SuperAdminHome() {
  const [stats, setStats] = useState<DashboardStats | null>(null)

  useEffect(() => {
    companiesAPI.getDashboard().then(setStats).catch(() => {})
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">License Server Overview</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/super-admin/company/all-company"
          className="p-6 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all"
        >
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-600">Companies</p>
              <p className="text-lg font-semibold text-gray-900">
                {stats ? `${stats.active_companies} / ${stats.total_companies}` : 'All Company'}
              </p>
            </div>
          </div>
        </Link>
        {stats && (
          <>
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-600">Expiring Soon</p>
              <p className="text-lg font-semibold text-gray-900">{stats.expiring_soon}</p>
            </div>
            <div className="p-6 bg-white rounded-lg border border-gray-200">
              <p className="text-sm font-medium text-gray-600">Suspended</p>
              <p className="text-lg font-semibold text-gray-900">{stats.suspended_companies}</p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
