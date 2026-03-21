import { useState, useEffect } from 'react'
import { companiesAPI, Plan, CreatePlan, ProductModule } from '../api/companies'
import toast from 'react-hot-toast'

function TableSkeleton() {
  return (
    <div className="space-y-4 p-5">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex gap-6">
          <div className="admin-skeleton h-4 flex-[2]" />
          <div className="admin-skeleton h-4 flex-1" />
          <div className="admin-skeleton h-4 flex-1" />
          <div className="admin-skeleton h-4 w-14" />
        </div>
      ))}
    </div>
  )
}

function formatModuleAccess(ma?: Record<string, string[]>): string {
  if (!ma || typeof ma !== 'object') return '—'
  const parts = Object.entries(ma).map(([mid, subs]) =>
    subs.length === 0 ? mid : `${mid} (${subs.join(', ')})`
  )
  return parts.length ? parts.join('; ') : 'All'
}

export default function SuperAdminPlans() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Plan | null>(null)

  const load = () => {
    setLoading(true)
    companiesAPI.getPlans()
      .then((p) => setPlans(Array.isArray(p) ? p : []))
      .catch((e: unknown) => toast.error((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to load'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    load()
  }, [])

  const handleDelete = async (p: Plan) => {
    if (!confirm(`Delete plan "${p.name}"?`)) return
    try {
      await companiesAPI.deletePlan(p.id)
      toast.success('Plan deleted')
      load()
    } catch (e: unknown) {
      toast.error((e as { response?: { data?: { detail?: string } } })?.response?.data?.detail || 'Failed to delete')
    }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900">Plans</h1>
          <p className="text-sm text-gray-500 mt-0.5">Subscription plans available for companies</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium px-4 py-2 transition-colors"
        >
          + Add Plan
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200">
        {loading ? (
          <TableSkeleton />
        ) : plans.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-sm text-gray-400 mb-4">No plans configured yet.</p>
            <button
              onClick={() => setShowCreate(true)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium px-4 py-2 transition-colors"
            >
              + Add Plan
            </button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-100">
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Max Users</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Module Access</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Action</th>
              </tr>
            </thead>
            <tbody>
              {plans.map((p) => (
                <tr key={p.id} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-medium text-gray-900">{p.name}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600">{p.max_users}</td>
                  <td className="px-5 py-3.5 text-sm text-gray-600 max-w-xs truncate" title={formatModuleAccess(p.module_access)}>{formatModuleAccess(p.module_access)}</td>
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md ${
                      p.is_active ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${p.is_active ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setEditing(p)}
                        className="text-xs font-medium px-2.5 py-1 rounded-md text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p)}
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
        )}
      </div>

      {showCreate && (
        <PlanModal
          onClose={() => setShowCreate(false)}
          onSaved={() => { setShowCreate(false); load() }}
        />
      )}
      {editing && (
        <PlanModal
          plan={editing}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load() }}
        />
      )}
    </div>
  )
}

function PlanModal({ plan, onClose, onSaved }: { plan?: Plan; onClose: () => void; onSaved: () => void }) {
  const [name, setName] = useState(plan?.name ?? '')
  const [maxUsers, setMaxUsers] = useState(plan?.max_users ?? 10)
  const [moduleAccess, setModuleAccess] = useState<Record<string, string[]>>(plan?.module_access ?? {})
  const [isActive, setIsActive] = useState(plan?.is_active ?? true)
  const [loading, setLoading] = useState(false)
  const [productModules, setProductModules] = useState<ProductModule[]>([])

  useEffect(() => {
    companiesAPI.getProductModules()
      .then((m) => setProductModules(Array.isArray(m) ? m : []))
      .catch(() => {})
  }, [])

  const toggleModule = (moduleId: string, submoduleId?: string) => {
    setModuleAccess((prev) => {
      const next = { ...prev }
      const mod = productModules.find((m) => m.id === moduleId)
      const allSubIds = mod?.submodules?.map((s) => s.id) ?? []
      const list = next[moduleId] ?? []

      if (!submoduleId) {
        if (moduleId in next) {
          delete next[moduleId]
        } else {
          next[moduleId] = []
        }
        return next
      }

      if (!(moduleId in next)) return next

      if (list.length === 0) {
        next[moduleId] = allSubIds.filter((id) => id !== submoduleId)
      } else if (list.includes(submoduleId)) {
        next[moduleId] = list.filter((s) => s !== submoduleId)
        if (next[moduleId]!.length === 0) delete next[moduleId]
      } else {
        const updated = [...list, submoduleId].sort()
        next[moduleId] = updated.length === allSubIds.length ? [] : updated
      }
      return next
    })
  }

  const isModuleEnabled = (moduleId: string) => moduleId in moduleAccess
  const isSubEnabled = (moduleId: string, subId: string) => {
    const list = moduleAccess[moduleId] ?? []
    if (list.length === 0) return true
    return list.includes(subId)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      toast.error('Plan name required')
      return
    }
    setLoading(true)
    try {
      const data: CreatePlan = {
        name: name.trim(),
        max_users: maxUsers,
        module_access: Object.keys(moduleAccess).length ? moduleAccess : undefined,
        is_active: isActive,
      }
      if (plan) {
        await companiesAPI.updatePlan(plan.id, data)
        toast.success('Plan updated')
      } else {
        await companiesAPI.createPlan(data)
        toast.success('Plan created')
      }
      onSaved()
    } catch (e: unknown) {
      const err = e as { response?: { data?: { detail?: string } } }
      toast.error(err?.response?.data?.detail || 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const inputClasses = 'w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none'

  return (
    <div className="admin-modal-overlay" onClick={onClose}>
      <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
        <div className="admin-modal__header">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{plan ? 'Edit Plan' : 'Add Plan'}</h3>
            <p className="text-sm text-gray-500 mt-0.5">{plan ? 'Update plan limits' : 'Define a new subscription plan'}</p>
          </div>
          <button onClick={onClose} className="p-1 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="admin-modal__body space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Plan Name *</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className={inputClasses} placeholder="e.g. Pro" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Max Users</label>
              <input type="number" min={1} value={maxUsers} onChange={(e) => setMaxUsers(parseInt(e.target.value) || 10)} className={inputClasses} />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Module Access</label>
              <p className="text-xs text-gray-500 mb-2">Select which product modules this plan includes. Empty submodule list = full module access.</p>
              <div className="space-y-3 max-h-48 overflow-y-auto pr-2 border border-gray-200 rounded-lg p-3">
                {productModules.map((mod) => (
                  <div key={mod.id} className="space-y-2">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isModuleEnabled(mod.id)}
                        onChange={() => toggleModule(mod.id)}
                        className="rounded border-gray-300"
                      />
                      <span className="text-sm font-medium text-gray-800">{mod.name}</span>
                    </label>
                    {mod.submodules && mod.submodules.length > 0 && isModuleEnabled(mod.id) && (
                      <div className="pl-6 flex flex-wrap gap-2">
                        {mod.submodules.map((sub) => (
                          <label key={sub.id} className="flex items-center gap-1.5 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={isSubEnabled(mod.id, sub.id)}
                              onChange={() => toggleModule(mod.id, sub.id)}
                              className="rounded border-gray-300 text-indigo-600"
                            />
                            <span className="text-xs text-gray-600">{sub.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                {productModules.length === 0 && (
                  <p className="text-xs text-gray-400">No modules configured. Add modules in product settings.</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="isActive" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} className="rounded border-gray-300" />
              <label htmlFor="isActive" className="text-sm font-medium text-gray-700">Active</label>
            </div>
          </div>
          <div className="admin-modal__footer">
            <button type="button" onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-lg text-sm font-medium px-4 py-2">Cancel</button>
            <button type="submit" disabled={loading} className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium px-4 py-2 disabled:opacity-50">{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
