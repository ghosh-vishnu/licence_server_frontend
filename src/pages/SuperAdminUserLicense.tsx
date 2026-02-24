import { useState, useEffect } from 'react'
import { companiesAPI, Subscriber } from '../api/companies'
import { licensesAPI, type SoftwareLicense as SL, type CreateSoftwareLicenseData } from '../api/licenses'
import toast from 'react-hot-toast'

export default function SuperAdminUserLicense() {
  const [licenses, setLicenses] = useState<SL[]>([])
  const [companies, setCompanies] = useState<Subscriber[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [viewLicense, setViewLicense] = useState<SL | null>(null)
  const [generateFor, setGenerateFor] = useState<Subscriber | null>(null)
  const [licenseKey, setLicenseKey] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [lic, comp] = await Promise.all([licensesAPI.list(), companiesAPI.list()])
      setLicenses(Array.isArray(lic) ? lic : [])
      setCompanies(Array.isArray(comp) ? comp : [])
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleGenerateJwt = async (sub: Subscriber) => {
    try {
      const res = await companiesAPI.generateLicense(sub.id)
      setGenerateFor(sub)
      setLicenseKey(res.license_key)
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to generate license')
    }
  }

  const handleActivate = async (lic: SL) => {
    try {
      await licensesAPI.activate(lic.id)
      toast.success('License activated')
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed')
    }
  }

  const handleDisable = async (lic: SL) => {
    try {
      await licensesAPI.disable(lic.id)
      toast.success('License disabled')
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed')
    }
  }

  const handleDelete = async (lic: SL) => {
    if (!confirm(`Delete license for ${lic.company_name}?`)) return
    try {
      await licensesAPI.delete(lic.id)
      toast.success('License deleted')
      load()
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">User License</h1>
          <p className="text-sm text-gray-500 mt-1">Software licenses and JWT keys for companies</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
        >
          + Create License
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">License Id</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Product</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">User Access</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {licenses.map((lic) => (
                <tr key={lic.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm font-mono text-gray-700">{lic.license_key}</td>
                  <td className="px-4 py-3 text-sm text-gray-900">{lic.company_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{lic.product_name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{lic.total_user_access}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {lic.expiration_date ? new Date(lic.expiration_date).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      lic.status === 'active' ? 'bg-green-100 text-green-800' :
                      lic.status === 'disabled' ? 'bg-gray-100 text-gray-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lic.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 flex gap-2 flex-wrap">
                    <button onClick={() => setViewLicense(lic)} className="text-sm text-blue-600 hover:text-blue-700">View</button>
                    {lic.status === 'active' ? (
                      <button onClick={() => handleDisable(lic)} className="text-sm text-orange-600 hover:text-orange-700">Disable</button>
                    ) : (
                      <button onClick={() => handleActivate(lic)} className="text-sm text-green-600 hover:text-green-700">Activate</button>
                    )}
                    <button onClick={() => handleDelete(lic)} className="text-sm text-red-600 hover:text-red-700">Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {licenses.length === 0 && (
            <p className="px-4 py-8 text-center text-gray-500">No licenses yet. Create one or generate JWT from All Company.</p>
          )}
        </div>
      )}

      <div className="border-t pt-4">
        <h3 className="text-sm font-medium text-gray-700 mb-2">Generate JWT License Key (for Product A activation)</h3>
        <div className="flex flex-wrap gap-2">
          {companies.filter(c => c.status === 'active').map((c) => (
            <button
              key={c.id}
              onClick={() => handleGenerateJwt(c)}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {showCreate && (
        <CreateLicenseModal
          companies={companies}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            load()
          }}
        />
      )}

      {viewLicense && (
        <ViewLicenseModal license={viewLicense} onClose={() => setViewLicense(null)} onExtend={() => { setViewLicense(null); load() }} />
      )}

      {generateFor && licenseKey && (
        <JwtModal company={generateFor} licenseKey={licenseKey} onClose={() => { setGenerateFor(null); setLicenseKey(null) }} />
      )}
    </div>
  )
}

function CreateLicenseModal({
  companies,
  onClose,
  onCreated,
}: {
  companies: Subscriber[]
  onClose: () => void
  onCreated: () => void
}) {
  const [companyId, setCompanyId] = useState('')
  const [productName, setProductName] = useState('Minitab')
  const [purchaseDate, setPurchaseDate] = useState('')
  const [expirationDate, setExpirationDate] = useState('')
  const [totalUserAccess, setTotalUserAccess] = useState(10)
  const [location, setLocation] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!companyId) {
      toast.error('Select company')
      return
    }
    setLoading(true)
    try {
      const data: CreateSoftwareLicenseData = {
        company: companyId,
        product_name: productName,
        total_user_access: totalUserAccess,
      }
      if (purchaseDate) data.purchase_date = purchaseDate
      if (expirationDate) data.expiration_date = expirationDate
      if (location) data.location = location
      if (description) data.description = description
      await licensesAPI.create(data)
      toast.success('License created')
      onCreated()
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to create')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Create License</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company *</label>
            <select value={companyId} onChange={(e) => setCompanyId(e.target.value)} className="w-full px-3 py-2 border rounded-md" required>
              <option value="">Select Company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
            <input value={productName} onChange={(e) => setProductName(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Purchase Date</label>
              <input type="date" value={purchaseDate} onChange={(e) => setPurchaseDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiration Date</label>
              <input type="date" value={expirationDate} onChange={(e) => setExpirationDate(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Total User Access</label>
            <input type="number" min={1} value={totalUserAccess} onChange={(e) => setTotalUserAccess(parseInt(e.target.value) || 10)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
            <input value={location} onChange={(e) => setLocation(e.target.value)} className="w-full px-3 py-2 border rounded-md" placeholder="e.g. India" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <input value={description} onChange={(e) => setDescription(e.target.value)} className="w-full px-3 py-2 border rounded-md" />
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">{loading ? 'Creating...' : 'Create'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}

function ViewLicenseModal({ license, onClose, onExtend }: { license: SL; onClose: () => void; onExtend: () => void }) {
  const [extendDays, setExtendDays] = useState(30)
  const [extending, setExtending] = useState(false)

  const handleExtend = async () => {
    setExtending(true)
    try {
      await licensesAPI.extend(license.id, { extend_days: extendDays })
      toast.success('License extended')
      onExtend()
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed')
    } finally {
      setExtending(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">License Details</h3>
        <dl className="space-y-2 text-sm">
          <div><dt className="text-gray-500">License Key</dt><dd className="font-mono">{license.license_key}</dd></div>
          <div><dt className="text-gray-500">Company</dt><dd>{license.company_name}</dd></div>
          <div><dt className="text-gray-500">Product</dt><dd>{license.product_name}</dd></div>
          <div><dt className="text-gray-500">User Access</dt><dd>{license.total_user_access}</dd></div>
          <div><dt className="text-gray-500">Purchase Date</dt><dd>{license.purchase_date || '-'}</dd></div>
          <div><dt className="text-gray-500">Expiration</dt><dd>{license.expiration_date ? new Date(license.expiration_date).toLocaleDateString() : '-'}</dd></div>
          <div><dt className="text-gray-500">Status</dt><dd>{license.status}</dd></div>
        </dl>
        <div className="mt-4 pt-4 border-t flex items-center gap-2">
          <input type="number" value={extendDays} onChange={(e) => setExtendDays(parseInt(e.target.value) || 30)} className="w-20 px-2 py-1 border rounded" />
          <span className="text-sm text-gray-600">days</span>
          <button onClick={handleExtend} disabled={extending} className="px-3 py-1 bg-blue-600 text-white rounded text-sm">Extend</button>
        </div>
        <button onClick={onClose} className="mt-4 px-4 py-2 border rounded-md hover:bg-gray-50">Close</button>
      </div>
    </div>
  )
}

function JwtModal({ company, licenseKey, onClose }: { company: Subscriber; licenseKey: string; onClose: () => void }) {
  const [copied, setCopied] = useState(false)
  const copy = () => {
    navigator.clipboard.writeText(licenseKey)
    setCopied(true)
    toast.success('Copied')
    setTimeout(() => setCopied(false), 2000)
  }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">JWT License Generated</h3>
        <p className="text-sm text-gray-500 mb-4">{company.name}</p>
        <div className="bg-gray-100 rounded p-4 font-mono text-sm break-all mb-4">{licenseKey}</div>
        <div className="flex gap-2">
          <button onClick={copy} className="px-4 py-2 bg-blue-600 text-white rounded-md">{copied ? 'Copied!' : 'Copy'}</button>
          <button onClick={onClose} className="px-4 py-2 border rounded-md hover:bg-gray-50">Close</button>
        </div>
      </div>
    </div>
  )
}
