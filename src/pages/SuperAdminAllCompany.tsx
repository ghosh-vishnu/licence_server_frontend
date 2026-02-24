import { useState, useEffect } from 'react'
import { companiesAPI, Subscriber } from '../api/companies'
import toast from 'react-hot-toast'

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
    <div className="space-y-4 sm:space-y-6 p-2 sm:p-0">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <h1 className="text-lg sm:text-xl font-semibold text-gray-900">All Company</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + Add Company
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-x-auto">
          <table className="min-w-[600px] w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                <th className="px-3 sm:px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-900">{c.name}</td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-600">{c.company_code || '-'}</td>
                  <td className="px-3 sm:px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-3 sm:px-4 py-3 text-sm text-gray-600">
                    {new Date(c.expiry).toLocaleDateString()}
                  </td>
                  <td className="px-3 sm:px-4 py-3 flex flex-wrap gap-2">
                    <button onClick={() => setEditing(c)} className="text-sm text-blue-600 hover:text-blue-700">Edit</button>
                    <button onClick={() => handleDelete(c)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {companies.length === 0 && (
            <p className="px-4 py-8 text-center text-gray-500">No companies yet. Add one to get started.</p>
          )}
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
  const showExpiry = d?.expiry ?? company.expiry
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 overflow-y-auto min-h-screen" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 my-4 sm:my-8 mx-2" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base sm:text-lg font-semibold mb-4">View Company</h3>
        {loading ? (
          <p className="text-gray-500">Loading...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : d ? (
          <dl className="space-y-3 text-sm">
            <div><dt className="text-gray-500">Name</dt><dd className="font-medium">{d.name}</dd></div>
            <div><dt className="text-gray-500">Code</dt><dd>{d.company_code || '-'}</dd></div>
            <div><dt className="text-gray-500">Email</dt><dd>{d.email || '-'}</dd></div>
            <div><dt className="text-gray-500">Phone</dt><dd>{d.phone || '-'}</dd></div>
            <div><dt className="text-gray-500">Address</dt><dd>{(d as any).address_line1 || d.address || '-'}</dd></div>
            <div><dt className="text-gray-500">Region (State)</dt><dd>{d.state || '-'}</dd></div>
            <div><dt className="text-gray-500">Country</dt><dd>{d.country || '-'}</dd></div>
            <div><dt className="text-gray-500">Time Zone</dt><dd>{d.time_zone || '-'}</dd></div>
            <div><dt className="text-gray-500">GST / License No</dt><dd>{(d as any).GST_NO || d.tax_id || '-'}</dd></div>
            <div><dt className="text-gray-500">Status</dt><dd><span className={`px-2 py-0.5 rounded text-xs ${d.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>{d.status}</span></dd></div>
            <div><dt className="text-gray-500">Expiry</dt><dd>{showExpiry ? new Date(showExpiry).toLocaleDateString() : '-'}</dd></div>
          </dl>
        ) : null}
        <div className="mt-6">
          <button onClick={onClose} className="w-full px-4 py-2 border rounded-md hover:bg-gray-50">Close</button>
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 overflow-y-auto min-h-screen" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 my-4 sm:my-8 mx-2" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base sm:text-lg font-semibold mb-4">Add Company</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md text-base" placeholder="e.g. New Company Ltd" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region (State)</label>
              <input value={state} onChange={(e) => setState(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="e.g. Asia" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="e.g. India" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
            <input value={timeZone} onChange={(e) => setTimeZone(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Asia/Kolkata" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address (Location)</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Main Street, City" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">License No (tax_id / GST)</label>
            <input value={taxId} onChange={(e) => setTaxId(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="29XXXXX1234X1XX" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Mobile No)</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="9122389911" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="company@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
            <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="company@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input type="password" value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Admin password" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
            <input type="password" value={adminConfirmPassword} onChange={(e) => setAdminConfirmPassword(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="Confirm admin password" />
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create'}</button>
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
  const [status, setStatus] = useState(company.status)
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-3 sm:p-4 overflow-y-auto min-h-screen" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto p-4 sm:p-6 my-4 sm:my-8 mx-2" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-base sm:text-lg font-semibold mb-4">Edit Company</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full px-3 py-2 border rounded-md" required />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <input value={address} onChange={(e) => setAddress(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Region (State)</label>
              <input value={state} onChange={(e) => setState(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <input value={country} onChange={(e) => setCountry(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Time Zone</label>
              <input value={timeZone} onChange={(e) => setTimeZone(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GST/CIN</label>
              <input value={taxId} onChange={(e) => setTaxId(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Admin Email</label>
            <input type="email" value={adminEmail} onChange={(e) => setAdminEmail(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
            <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full px-3 py-2 border rounded-md">
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="suspended">Suspended</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
