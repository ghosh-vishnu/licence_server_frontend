import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { companiesAPI, Subscriber, Plan } from '../api/companies'
import { licensesAPI, type SoftwareLicense as SL, type CreateSoftwareLicenseData } from '../api/licenses'
import { extractAuthError } from '../api/errorUtils'
import { createLicenseSchema, type CreateLicenseFormValues } from '../schemas/licenseForm'
import { RoleAllocationCard } from '../components/RoleAllocationCard'
import toast from 'react-hot-toast'

export default function SuperAdminUserLicense() {
  const [licenses, setLicenses] = useState<SL[]>([])
  const [companies, setCompanies] = useState<Subscriber[]>([])
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [viewLicense, setViewLicense] = useState<SL | null>(null)
  const [generateFor, setGenerateFor] = useState<Subscriber | null>(null)
  const [licenseKey, setLicenseKey] = useState<string | null>(null)

  const load = async () => {
    setLoading(true)
    try {
      const [lic, comp, pl] = await Promise.all([
        licensesAPI.list(),
        companiesAPI.list(),
        companiesAPI.getPlans(),
      ])
      setLicenses(Array.isArray(lic) ? lic : [])
      setCompanies(Array.isArray(comp) ? comp : [])
      setPlans(Array.isArray(pl) ? pl : [])
    } catch (e: unknown) {
      toast.error(extractAuthError(e, 'Failed to load'))
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
    } catch (e: unknown) {
      toast.error(extractAuthError(e, 'Failed to generate license'))
    }
  }

  const handleActivate = async (lic: SL) => {
    try {
      await licensesAPI.activate(lic.id)
      toast.success('License activated')
      load()
    } catch (e: unknown) {
      toast.error(extractAuthError(e, 'Failed'))
    }
  }

  const handleDisable = async (lic: SL) => {
    try {
      await licensesAPI.disable(lic.id)
      toast.success('License disabled')
      load()
    } catch (e: unknown) {
      toast.error(extractAuthError(e, 'Failed'))
    }
  }

  const handleDelete = async (lic: SL) => {
    if (!confirm(`Delete license for ${lic.company_name}?`)) return
    try {
      await licensesAPI.delete(lic.id)
      toast.success('License deleted')
      load()
    } catch (e: unknown) {
      toast.error(extractAuthError(e, 'Failed'))
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
          plans={plans}
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
  plans,
  onClose,
  onCreated,
}: {
  companies: Subscriber[]
  plans: Plan[]
  onClose: () => void
  onCreated: () => void
}) {
  const [loading, setLoading] = useState(false)
  const planMap = new Map(plans.map((p) => [p.id, p.max_users]))

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm<CreateLicenseFormValues>({
    resolver: yupResolver(createLicenseSchema),
    mode: 'onChange',
    defaultValues: {
      company: '',
      product_name: 'Minitab',
      purchase_date: '',
      expiration_date: '',
      max_super_admins: 1,
      max_company_admins: 0,
      max_users: 10,
      location: '',
      description: '',
    },
  })

  const companyId = watch('company')
  const selectedCompany = companies.find((c) => c.id === companyId)
  const planLimit = selectedCompany?.plan ? planMap.get(selectedCompany.plan) ?? null : null

  const sa = watch('max_super_admins') ?? 0
  const ca = watch('max_company_admins') ?? 0
  const u = watch('max_users') ?? 0
  const totalAllocation =
    (typeof sa === 'number' ? sa : parseInt(String(sa), 10) || 0) +
    (typeof ca === 'number' ? ca : parseInt(String(ca), 10) || 0) +
    (typeof u === 'number' ? u : parseInt(String(u), 10) || 0)

  const exceedsPlan = planLimit != null && planLimit > 0 && totalAllocation > planLimit
  const canSubmit = isValid && !exceedsPlan

  const onSubmit = async (data: CreateLicenseFormValues) => {
    setLoading(true)
    try {
      const payload: CreateSoftwareLicenseData = {
        company: data.company,
        product_name: (data.product_name || 'Minitab').trim().slice(0, 100),
        role_limits: {
          max_super_admins: Math.max(0, Math.min(100, Number(data.max_super_admins) || 0)),
          max_company_admins: Math.max(0, Math.min(1000, Number(data.max_company_admins) || 0)),
          max_users: Math.max(1, Math.min(100000, Number(data.max_users) || 10)),
        },
      }
      if (data.purchase_date) payload.purchase_date = data.purchase_date
      if (data.expiration_date) payload.expiration_date = data.expiration_date
      if (data.location?.trim()) payload.location = data.location.trim().slice(0, 255)
      if (data.description?.trim()) payload.description = data.description.trim().slice(0, 500)
      await licensesAPI.create(payload)
      toast.success('License created')
      onCreated()
    } catch (err: unknown) {
      toast.error(extractAuthError(err, 'Failed to create'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 overflow-y-auto" onClick={onClose}>
      <div
        className="bg-white rounded-xl shadow-2xl max-w-lg w-full my-8 mx-4"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-5 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Create License</h3>
          <p className="text-sm text-gray-500 mt-0.5">Define role-based allocation for the company</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Company *</label>
            <select
              {...register('company')}
              className={`block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-3 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${errors.company ? 'border-red-500' : ''}`}
            >
              <option value="">Select Company</option>
              {companies.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            {errors.company && <p className="mt-1 text-sm text-red-600">{errors.company.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
            <input
              {...register('product_name')}
              maxLength={100}
              className={`block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-3 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 ${errors.product_name ? 'border-red-500' : ''}`}
              placeholder="Minitab"
            />
            {errors.product_name && <p className="mt-1 text-sm text-red-600">{errors.product_name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Purchase Date</label>
              <input
                type="date"
                {...register('purchase_date')}
                className="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-3 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiration Date</label>
              <input
                type="date"
                {...register('expiration_date')}
                className="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-3 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
          </div>

          <RoleAllocationCard register={register} watch={watch} errors={errors} planLimit={planLimit} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
            <input
              {...register('location')}
              className="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-3 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="e.g. India"
              maxLength={255}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea
              {...register('description')}
              rows={2}
              className="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-3 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              placeholder="Optional notes"
              maxLength={500}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="flex-1 px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create'}
            </button>
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
    } catch (e: unknown) {
      toast.error(extractAuthError(e, 'Failed'))
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
          <div><dt className="text-gray-500">Total User Access</dt><dd>{license.total_user_access}</dd></div>
          {license.role_limits && (
            <div>
              <dt className="text-gray-500">Role Allocation</dt>
              <dd className="mt-1 text-gray-700">
                Super Admins: {license.role_limits.max_super_admins}, Admins: {license.role_limits.max_company_admins}, Users: {license.role_limits.max_users}
              </dd>
            </div>
          )}
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
