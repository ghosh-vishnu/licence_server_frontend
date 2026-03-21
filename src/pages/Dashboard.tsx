import { useState, useEffect } from 'react'
import { companiesAPI, Subscriber, Plan } from '../api/companies'
import toast from 'react-hot-toast'

export default function Dashboard() {
  const [companies, setCompanies] = useState<Subscriber[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [generateFor, setGenerateFor] = useState<Subscriber | null>(null)
  const [licenseKey, setLicenseKey] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [c, p] = await Promise.all([companiesAPI.list(), companiesAPI.getPlans()])
      setCompanies(Array.isArray(c) ? c : [])
      setPlans(Array.isArray(p) ? p : [])
    } catch (e: any) {
      toast.error(e.response?.data?.detail || 'Failed to load')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleGenerate = async (sub: Subscriber) => {
    try {
      const res = await companiesAPI.generateLicense(sub.id)
      setGenerateFor(sub)
      setLicenseKey(res.license_key)
    } catch (e: any) {
      toast.error(e.response?.data?.error || 'Failed to generate license')
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Companies</h1>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          + Add Company
        </button>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading...</p>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {companies.map((c) => (
                <tr key={c.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-900">{c.name}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.company_code || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-600">{c.plan_name}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                      c.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => handleGenerate(c)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      Generate License
                    </button>
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
          plans={plans}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false)
            load()
          }}
        />
      )}

      {generateFor && licenseKey && (
        <LicenseModal
          company={generateFor}
          licenseKey={licenseKey}
          onClose={() => {
            setGenerateFor(null)
            setLicenseKey(null)
          }}
        />
      )}
    </div>
  )
}

function CreateCompanyModal({
  plans,
  onClose,
  onCreated,
}: {
  plans: Plan[]
  onClose: () => void
  onCreated: () => void
}) {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [companyCode, setCompanyCode] = useState('')
  const [planId, setPlanId] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim() || !planId) {
      toast.error('Name and Plan required')
      return
    }
    setLoading(true)
    try {
      await companiesAPI.create({
        name: name.trim(),
        email: email.trim() || undefined,
        company_code: companyCode.trim() || undefined,
        plan: planId,
      })
      toast.success('Company created')
      onCreated()
    } catch (err: any) {
      const msg = err.response?.data?.company_code?.[0] || err.response?.data?.detail || 'Failed'
      toast.error(msg)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-4">Add Company</h3>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Code</label>
            <input
              value={companyCode}
              onChange={(e) => setCompanyCode(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="e.g. TCS, HCL"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan *</label>
            <select
              value={planId}
              onChange={(e) => setPlanId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            >
              <option value="">Select Plan</option>
              {plans.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.max_users} users)
                </option>
              ))}
            </select>
          </div>
          <div className="flex gap-2 pt-4">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
              {loading ? 'Creating...' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function LicenseModal({
  company,
  licenseKey,
  onClose,
}: {
  company: Subscriber
  licenseKey: string
  onClose: () => void
}) {
  const [copied, setCopied] = useState(false)

  const copy = () => {
    navigator.clipboard.writeText(licenseKey)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-semibold mb-2">License Generated</h3>
        <p className="text-sm text-gray-500 mb-4">{company.name}</p>
        <div className="bg-gray-100 rounded p-4 font-mono text-sm break-all mb-4">
          {licenseKey}
        </div>
        <div className="flex gap-2">
          <button onClick={copy} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button onClick={onClose} className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
