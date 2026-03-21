import { useState, useEffect } from 'react'
import { companiesAPI, Subscriber } from '../api/companies'
import toast from 'react-hot-toast'

/** Status badge classes - only Active and Inactive */
function getStatusBadgeClasses(status: string) {
  return status === 'active' ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
}
function getStatusDotClasses(status: string) {
  return status === 'active' ? 'bg-emerald-500' : 'bg-gray-400'
}

const STATUS_OPTIONS: { value: string; label: string }[] = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

function StatusDropdown({
  company,
  onStatusChange,
}: {
  company: Subscriber
  onStatusChange: () => void
}) {
  const [open, setOpen] = useState(false)
  const [updating, setUpdating] = useState(false)

  const handleChange = async (newStatus: string) => {
    if (newStatus === company.status) {
      setOpen(false)
      return
    }
    setUpdating(true)
    try {
      await companiesAPI.update(company.id, { status: newStatus })
      toast.success(`Status updated to ${newStatus}`)
      setOpen(false)
      onStatusChange()
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        disabled={updating}
        title="Click to change status"
        className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md capitalize cursor-pointer hover:ring-2 hover:ring-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-60 ${getStatusBadgeClasses(company.status)}`}
      >
        <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotClasses(company.status)}`} />
        {company.status === 'active' ? 'Active' : 'Inactive'}
        <svg className="w-3 h-3 ml-0.5 opacity-70" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} aria-hidden="true" />
          <div className="absolute left-0 top-full mt-1 z-20 py-1 min-w-[140px] bg-white rounded-lg shadow-lg border border-gray-200">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => handleChange(opt.value)}
                className={`block w-full text-left px-3 py-2 text-sm capitalize hover:bg-gray-50 ${
                  company.status === opt.value ? 'text-indigo-600 font-medium bg-indigo-50' : 'text-gray-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default function SuperAdminAllCompany() {
  const [companies, setCompanies] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Subscriber | null>(null)
  const [viewing, setViewing] = useState<Subscriber | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const c = await companiesAPI.list()
      setCompanies(Array.isArray(c) ? c : [])
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (c: Subscriber) => {
    if (!confirm(`Delete "${c.name}"?`)) return
    try {
      await companiesAPI.delete(c.id)
      toast.success('Company deleted')
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to delete')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">All Company</h1>
          <p className="text-sm text-gray-500 mt-0.5">Manage registered companies</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium px-4 py-2 transition-colors"
        >
          + Add Company
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200">
          <div className="px-6 py-3 border-b border-gray-100">
            <div className="flex gap-16">
              <div className="admin-skeleton h-3 w-16" />
              <div className="admin-skeleton h-3 w-12" />
              <div className="admin-skeleton h-3 w-14" />
              <div className="admin-skeleton h-3 w-14" />
            </div>
          </div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center gap-16 px-6 py-4 border-b border-gray-100 last:border-b-0">
              <div className="admin-skeleton h-4 w-32" />
              <div className="admin-skeleton h-4 w-20" />
              <div className="admin-skeleton h-4 w-16" />
              <div className="flex gap-2">
                <div className="admin-skeleton h-6 w-10 rounded-md" />
                <div className="admin-skeleton h-6 w-12 rounded-md" />
                <div className="admin-skeleton h-6 w-14 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      ) : companies.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 py-16 flex flex-col items-center justify-center">
          <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm font-medium text-gray-900 mb-1">No companies yet</p>
          <p className="text-sm text-gray-500 mb-4">Add your first company to get started.</p>
          <button
            onClick={() => setShowCreate(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium px-4 py-2 transition-colors"
          >
            + Add Company
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-x-auto">
          <table className="min-w-[600px] w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Code</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {companies.map((c) => (
                <tr key={c.id} className="border-b border-gray-100 hover:bg-gray-50/50 last:border-b-0">
                  <td className="px-6 py-3.5 text-sm font-medium text-gray-900">{c.name}</td>
                  <td className="px-6 py-3.5 text-sm text-gray-500">{c.company_code || '-'}</td>
                  <td className="px-6 py-3.5">
                    <StatusDropdown company={c} onStatusChange={load} />
                  </td>
                  <td className="px-6 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setViewing(c)}
                        className="text-xs font-medium px-2.5 py-1 rounded-md text-gray-700 bg-gray-50 hover:bg-gray-100 transition-colors"
                      >
                        View
                      </button>
                      <button
                        onClick={() => setEditing(c)}
                        className="text-xs font-medium px-2.5 py-1 rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(c)}
                        className="text-xs font-medium px-2.5 py-1 rounded-md text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showCreate && (
        <CreateCompanyModal
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            load()
          }}
        />
      )}

      {editing && (
        <EditCompanyModal
          company={editing}
          onClose={() => setEditing(null)}
          onUpdated={() => {
            setEditing(null)
            load()
          }}
        />
      )}

      {viewing && (
        <ViewCompanyModal
          company={viewing}
          onClose={() => setViewing(null)}
        />
      )}
    </div>
  )
}

function ViewCompanyModal({
  company,
  onClose,
}: {
  company: Subscriber
  onClose: () => void
}) {
  const [data, setData] = useState<Subscriber | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    companiesAPI.get(company.id, { view: 'minimal' })
      .then(setData)
      .catch((e: any) => setError(e.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }, [company.id])

  const d = data as Subscriber & { address_line1?: string; GST_NO?: string }
  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">View Company</h3>
            <p className="text-sm text-gray-500 mt-0.5">Company details overview</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="admin-modal__body">
          {loading ? (
            <div className="space-y-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="flex flex-col gap-1.5">
                  <div className="admin-skeleton h-3 w-20" />
                  <div className="admin-skeleton h-4 w-48" />
                </div>
              ))}
            </div>
          ) : error ? (
            <p className="text-sm text-red-600">{error}</p>
          ) : d ? (
            <dl className="space-y-4">
              <div><dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Name</dt><dd className="text-sm font-medium text-gray-900 mt-0.5">{d.name}</dd></div>
              <div><dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Code</dt><dd className="text-sm text-gray-700 mt-0.5">{d.company_code || '-'}</dd></div>
              <div><dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Email</dt><dd className="text-sm text-gray-700 mt-0.5">{d.email || '-'}</dd></div>
              <div><dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</dt><dd className="text-sm text-gray-700 mt-0.5">{d.phone || '-'}</dd></div>
              <div><dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Address</dt><dd className="text-sm text-gray-700 mt-0.5">{(d as any).address_line1 || d.address || '-'}</dd></div>
              <div><dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Region (State)</dt><dd className="text-sm text-gray-700 mt-0.5">{d.state || '-'}</dd></div>
              <div><dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Country</dt><dd className="text-sm text-gray-700 mt-0.5">{d.country || '-'}</dd></div>
              <div><dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Time Zone</dt><dd className="text-sm text-gray-700 mt-0.5">{d.time_zone || '-'}</dd></div>
              <div><dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">GST / License No</dt><dd className="text-sm text-gray-700 mt-0.5">{(d as any).GST_NO || d.tax_id || '-'}</dd></div>
              <div>
                <dt className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</dt>
                <dd className="mt-1">
                  <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${getStatusBadgeClasses(d.status)}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${getStatusDotClasses(d.status)}`} />
                    {d.status === 'active' ? 'Active' : 'Inactive'}
                  </span>
                </dd>
              </div>
            </dl>
          ) : null}
        </div>
        <div className="admin-modal__footer">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium px-4 py-2 transition-colors">Close</button>
        </div>
      </div>
    </div>
  )
}

function CreateCompanyModal({
  onClose,
  onCreated,
}: {
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [state, setState] = useState('')
  const [country, setCountry] = useState('')
  const [timeZone, setTimeZone] = useState('Asia/Kolkata')
  const [address, setAddress] = useState('')
  const [taxId, setTaxId] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [adminEmail, setAdminEmail] = useState('')
  const [adminPassword, setAdminPassword] = useState('')
  const [adminConfirmPassword, setAdminConfirmPassword] = useState('')
  const [status, setStatus] = useState<'active' | 'inactive'>('active')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Company Name required')
      return
    }
    if (adminPassword && adminPassword !== adminConfirmPassword) {
      toast.error('Password and Confirm Password must match')
      return
    }
    setLoading(true)
    try {
      await companiesAPI.create({
        name: name.trim(),
        state: state.trim() || undefined,
        country: country.trim() || undefined,
        time_zone: timeZone || undefined,
        address: address.trim() || undefined,
        tax_id: taxId.trim() || undefined,
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        admin_email: adminEmail.trim() || undefined,
        admin_password: adminPassword || undefined,
        admin_confirm_password: adminConfirmPassword || undefined,
        status,
      })
      toast.success('Company created')
      onCreated()
    } catch (err: any) {
      const d = err.response?.data
      let msg = 'Failed'
      if (typeof d?.detail === 'string') msg = d.detail
      else if (d && typeof d === 'object') {
        const first = Object.values(d).flat().find((v) => typeof v === 'string')
        if (first) msg = String(first)
        else {
          const arr = Object.entries(d).map(([k, v]) => `${k}: ${Array.isArray(v) ? v[0] : v}`)
          msg = arr[0] ?? msg
        }
      }
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = "w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Add Company</h3>
            <p className="text-sm text-gray-500 mt-0.5">Register a new company account</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal__body space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="e.g. New Company Ltd" required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Region (State)</label>
                <input value={state} onChange={(e) => setState(e.target.value)} className={inputClasses} placeholder="e.g. Asia" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClasses} placeholder="e.g. India" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Zone</label>
              <input value={timeZone} onChange={(e) => setTimeZone(e.target.value)} className={inputClasses} placeholder="Asia/Kolkata" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address (Location)</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClasses} placeholder="Main Street, City" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">License No (tax_id / GST)</label>
              <input value={taxId} onChange={(e) => setTaxId(e.target.value)} className={inputClasses} placeholder="29XXXXX1234X1XX" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone (Mobile No)</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} placeholder="9122389911" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} placeholder="company@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as typeof status)} className={inputClasses}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
              <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className={inputClasses} placeholder="company@example.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className={inputClasses} placeholder="Admin password" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm Password</label>
              <input type="password" value={adminConfirmPassword} onChange={(e) => setAdminConfirmPassword(e.target.value)} className={inputClasses} placeholder="Confirm admin password" />
            </div>
          </div>
          <div className="admin-modal__footer">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium px-4 py-2 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50">{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function EditCompanyModal({
  company,
  onClose,
  onUpdated,
}: {
  company: Subscriber
  onClose: () => void
  onUpdated: () => void
}) {
  const [name, setName] = useState(company.name)
  const [email, setEmail] = useState(company.email || '')
  const [phone, setPhone] = useState(company.phone || '')
  const [address, setAddress] = useState(company.address || '')
  const [state, setState] = useState(company.state || '')
  const [country, setCountry] = useState(company.country || '')
  const [timeZone, setTimeZone] = useState(company.time_zone || 'Asia/Kolkata')
  const [taxId, setTaxId] = useState(company.tax_id || '')
  const [adminEmail, setAdminEmail] = useState(company.admin_email || '')
  const [status, setStatus] = useState<'active' | 'inactive'>(company.status === 'active' ? 'active' : 'inactive')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await companiesAPI.update(company.id, {
        name: name.trim(),
        email: email.trim() || undefined,
        phone: phone.trim() || undefined,
        address: address.trim() || undefined,
        state: state.trim() || undefined,
        country: country.trim() || undefined,
        time_zone: timeZone || undefined,
        tax_id: taxId.trim() || undefined,
        admin_email: adminEmail.trim() || undefined,
        status,
      })
      toast.success('Company updated')
      onUpdated()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to update')
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = "w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Edit Company</h3>
            <p className="text-sm text-gray-500 mt-0.5">Update company information</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal__body space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
                <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputClasses} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Address</label>
              <input value={address} onChange={(e) => setAddress(e.target.value)} className={inputClasses} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Region (State)</label>
                <input value={state} onChange={(e) => setState(e.target.value)} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Country</label>
                <input value={country} onChange={(e) => setCountry(e.target.value)} className={inputClasses} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Zone</label>
                <input value={timeZone} onChange={(e) => setTimeZone(e.target.value)} className={inputClasses} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">GST/CIN</label>
                <input value={taxId} onChange={(e) => setTaxId(e.target.value)} className={inputClasses} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Admin Email</label>
              <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className={inputClasses} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as 'active' | 'inactive')} className={inputClasses}>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
          <div className="admin-modal__footer">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium px-4 py-2 transition-colors">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
