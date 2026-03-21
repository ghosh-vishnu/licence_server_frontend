import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { companiesAPI, Subscriber } from '../api/companies'
import { licensesAPI, SoftwareLicense } from '../api/licenses'
import toast from 'react-hot-toast'

type CompanyWithLicenses = Subscriber & { licenses: SoftwareLicense[] }

export default function SuperAdminSubscriptions() {
  const [data, setData] = useState<CompanyWithLicenses[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([companiesAPI.list(), licensesAPI.list()])
      .then(([companies, licenses]) => {
        const compMap = new Map<string, CompanyWithLicenses>()
        for (const c of Array.isArray(companies) ? companies : []) {
          compMap.set(c.id, { ...c, licenses: [] })
        }
        for (const lic of Array.isArray(licenses) ? licenses : []) {
          const companyId = lic.company
          if (companyId && compMap.has(companyId)) {
            compMap.get(companyId)!.licenses.push(lic)
          }
        }
        setData(Array.from(compMap.values()).sort((a, b) => a.name.localeCompare(b.name)))
      })
      .catch(() => toast.error('Failed to load'))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Subscriptions</h1>
        <p className="text-sm text-gray-500 mt-0.5">Company license subscriptions overview</p>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 p-6 space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="admin-skeleton h-16 rounded-lg" />
          ))}
        </div>
      ) : data.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 text-center">
          <p className="text-sm text-gray-400">No companies yet.</p>
          <Link to="/super-admin/company/all-company" className="text-indigo-600 hover:text-indigo-700 text-sm font-medium mt-2 inline-block">Add a company</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {data.map((c) => (
            <div key={c.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
                <div>
                  <h3 className="font-medium text-gray-900">{c.name}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{c.company_code || '—'} · {c.email || '—'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-md ${
                    c.status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {c.status}
                  </span>
                  <Link
                    to="/super-admin/company/user-license"
                    className="text-xs font-medium text-indigo-600 hover:text-indigo-700"
                  >
                    Manage Licenses
                  </Link>
                </div>
              </div>
              <div className="px-5 py-3">
                {c.licenses.length === 0 ? (
                  <p className="text-sm text-gray-400">No licenses assigned</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {c.licenses.map((lic) => (
                      <div
                        key={lic.id}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm"
                      >
                        <span className="font-mono text-gray-600">{lic.license_key}</span>
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          lic.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {lic.status}
                        </span>
                        <span className="text-gray-400">·</span>
                        <span className="text-gray-500">{lic.total_user_access} users</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
