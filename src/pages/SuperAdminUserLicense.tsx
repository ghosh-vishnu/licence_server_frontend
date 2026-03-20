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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">User License</h1>
          <p className="text-sm text-gray-500 mt-0.5">Software licenses and JWT keys for companies</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium px-4 py-2 transition-colors"
        >
          + Create License
        </button>
      </div>

      {loading ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-100 grid grid-cols-7 gap-4">
            {Array.from({ length: 7 }).map((_, i) => (
              <div key={i} className="admin-skeleton h-3 w-16 rounded" />
            ))}
          </div>
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="px-5 py-4 border-b border-gray-100 grid grid-cols-7 gap-4 items-center">
              <div className="admin-skeleton h-4 w-24" />
              <div className="admin-skeleton h-4 w-20" />
              <div className="admin-skeleton h-4 w-16" />
              <div className="admin-skeleton h-4 w-10" />
              <div className="admin-skeleton h-4 w-20" />
              <div className="admin-skeleton h-4 w-14" />
              <div className="admin-skeleton h-4 w-28" />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="min-w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">License ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Company</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User Access</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Expiry</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {licenses.map((lic) => (
                <tr key={lic.id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-mono text-gray-600">{lic.license_key}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{lic.company_name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{lic.product_name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">{lic.total_user_access}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-500">
                    {lic.expiration_date ? new Date(lic.expiration_date).toLocaleDateString() : '—'}
                  </td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${
                      lic.status === 'active'
                        ? 'bg-emerald-50 text-emerald-700'
                        : lic.status === 'disabled'
                        ? 'bg-gray-100 text-gray-600'
                        : 'bg-amber-50 text-amber-700'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        lic.status === 'active'
                          ? 'bg-emerald-500'
                          : lic.status === 'disabled'
                          ? 'bg-gray-400'
                          : 'bg-amber-500'
                      }`} />
                      {lic.status}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <button
                        onClick={() => setViewLicense(lic)}
                        className="text-indigo-600 bg-indigo-50 hover:bg-indigo-100 text-xs font-medium px-2.5 py-1 rounded-md transition-colors"
                      >
                        View
                      </button>
                      {lic.status === 'active' ? (
                        <button
                          onClick={() => handleDisable(lic)}
                          className="text-amber-600 bg-amber-50 hover:bg-amber-100 text-xs font-medium px-2.5 py-1 rounded-md transition-colors"
                        >
                          Disable
                        </button>
                      ) : (
                        <button
                          onClick={() => handleActivate(lic)}
                          className="text-emerald-600 bg-emerald-50 hover:bg-emerald-100 text-xs font-medium px-2.5 py-1 rounded-md transition-colors"
                        >
                          Activate
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(lic)}
                        className="text-red-600 bg-red-50 hover:bg-red-100 text-xs font-medium px-2.5 py-1 rounded-md transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {licenses.length === 0 && (
            <div className="px-5 py-12 text-center">
              <div className="text-gray-400 mb-1">
                <svg className="w-10 h-10 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </div>
              <p className="text-sm text-gray-500">No licenses yet. Create one or generate JWT from the section below.</p>
            </div>
          )}
        </div>
      )}

      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-900">Generate JWT License Key</h3>
          <p className="text-xs text-gray-500 mt-0.5">Generate a signed JWT key for Product A activation</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {companies.filter(c => c.status === 'active').map((c) => (
            <button
              key={c.id}
              onClick={() => handleGenerateJwt(c)}
              className="border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium px-4 py-2 transition-colors"
            >
              {c.name}
            </button>
          ))}
          {companies.filter(c => c.status === 'active').length === 0 && !loading && (
            <p className="text-sm text-gray-400">No active companies available</p>
          )}
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
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Create License</h3>
            <p className="text-sm text-gray-500 mt-0.5">Define role-based allocation for the company</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="admin-modal__body space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Company *</label>
              <select
                {...register('company')}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow bg-white ${errors.company ? 'border-red-300' : 'border-gray-200'}`}
              >
                <option value="">Select Company</option>
                {companies.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
              {errors.company && <p className="mt-1.5 text-xs text-red-600">{errors.company.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name *</label>
              <input
                {...register('product_name')}
                maxLength={100}
                className={`w-full px-3 py-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow ${errors.product_name ? 'border-red-300' : 'border-gray-200'}`}
                placeholder="Minitab"
              />
              {errors.product_name && <p className="mt-1.5 text-xs text-red-600">{errors.product_name.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Purchase Date</label>
                <input
                  type="date"
                  {...register('purchase_date')}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Expiration Date</label>
                <input
                  type="date"
                  {...register('expiration_date')}
                  className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                />
              </div>
            </div>

            <RoleAllocationCard register={register} watch={watch} errors={errors} planLimit={planLimit} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Location</label>
              <input
                {...register('location')}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
                placeholder="e.g. India"
                maxLength={255}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
              <textarea
                {...register('description')}
                rows={2}
                className="w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow resize-none"
                placeholder="Optional notes"
                maxLength={500}
              />
            </div>
          </div>
          <div className="admin-modal__footer">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium px-4 py-2 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !canSubmit}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating…' : 'Create'}
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

  const details = [
    { label: 'License Key', value: <span className="font-mono text-gray-600 text-xs break-all">{license.license_key}</span> },
    { label: 'Company', value: license.company_name },
    { label: 'Product', value: license.product_name },
    { label: 'Total User Access', value: license.total_user_access },
    ...(license.role_limits ? [{
      label: 'Role Allocation',
      value: `Super Admins: ${license.role_limits.max_super_admins}, Admins: ${license.role_limits.max_company_admins}, Users: ${license.role_limits.max_users}`
    }] : []),
    { label: 'Purchase Date', value: license.purchase_date || '—' },
    { label: 'Expiration', value: license.expiration_date ? new Date(license.expiration_date).toLocaleDateString() : '—' },
    {
      label: 'Status',
      value: (
        <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${
          license.status === 'active'
            ? 'bg-emerald-50 text-emerald-700'
            : license.status === 'disabled'
            ? 'bg-gray-100 text-gray-600'
            : 'bg-amber-50 text-amber-700'
        }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${
            license.status === 'active'
              ? 'bg-emerald-500'
              : license.status === 'disabled'
              ? 'bg-gray-400'
              : 'bg-amber-500'
          }`} />
          {license.status}
        </span>
      ),
    },
  ]

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">License Details</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="admin-modal__body">
          <dl className="space-y-3.5">
            {details.map((d, i) => (
              <div key={i} className="flex items-start justify-between gap-4">
                <dt className="text-sm text-gray-400 shrink-0">{d.label}</dt>
                <dd className="text-sm text-gray-900 text-right">{d.value}</dd>
              </div>
            ))}
          </dl>
          <div className="mt-5 pt-5 border-t border-gray-100">
            <label className="block text-sm font-medium text-gray-700 mb-2">Extend License</label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={extendDays}
                onChange={(e) => setExtendDays(parseInt(e.target.value) || 30)}
                className="w-20 px-3 py-2 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-shadow"
              />
              <span className="text-sm text-gray-500">days</span>
              <button
                onClick={handleExtend}
                disabled={extending}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium px-4 py-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {extending ? 'Extending…' : 'Extend'}
              </button>
            </div>
          </div>
        </div>
        <div className="admin-modal__footer">
          <button
            onClick={onClose}
            className="border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium px-4 py-2 transition-colors"
          >
            Close
          </button>
        </div>
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
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">JWT License Generated</h3>
            <p className="text-sm text-gray-500 mt-0.5">{company.name}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="admin-modal__body">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 font-mono text-xs text-gray-700 break-all leading-relaxed select-all">
            {licenseKey}
          </div>
        </div>
        <div className="admin-modal__footer">
          <button
            onClick={onClose}
            className="border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium px-4 py-2 transition-colors"
          >
            Close
          </button>
          <button
            onClick={copy}
            className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium px-4 py-2 transition-colors"
          >
            {copied ? 'Copied!' : 'Copy Key'}
          </button>
        </div>
      </div>
    </div>
  )
}
