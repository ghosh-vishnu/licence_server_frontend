import { useState, useEffect } from 'react'
import { settingsAPI } from '../api/settings'
import toast from 'react-hot-toast'

export default function SuperAdminSettings() {
  const [productName, setProductName] = useState('Minitab')
  const [supportEmail, setSupportEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    settingsAPI.get()
      .then((data) => {
        setProductName(data.product_name || 'Minitab')
        setSupportEmail(data.support_email || '')
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      await settingsAPI.update({
        product_name: productName || 'Minitab',
        support_email: supportEmail || '',
      })
      toast.success('Settings saved')
    } catch {
      toast.error('Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const inputClasses = 'w-full px-4 py-2.5 rounded-lg border border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Settings</h1>
        <p className="text-sm text-gray-500 mt-0.5">System configuration</p>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-6 max-w-xl">
        {loading ? (
          <div className="space-y-4">
            <div className="admin-skeleton h-4 w-24" />
            <div className="admin-skeleton h-10 w-full" />
            <div className="admin-skeleton h-4 w-28" />
            <div className="admin-skeleton h-10 w-full" />
          </div>
        ) : (
          <form onSubmit={handleSave} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Product Name</label>
              <input
                value={productName}
                onChange={(e) => setProductName(e.target.value)}
                className={inputClasses}
                placeholder="e.g. Minitab"
              />
              <p className="text-xs text-gray-500 mt-1">Default product name for license generation</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Support Email</label>
              <input
                type="email"
                value={supportEmail}
                onChange={(e) => setSupportEmail(e.target.value)}
                className={inputClasses}
                placeholder="support@example.com"
              />
              <p className="text-xs text-gray-500 mt-1">Contact email for license support</p>
            </div>
            <div className="pt-2">
              <button
                type="submit"
                disabled={saving}
                className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium px-5 py-2.5 disabled:opacity-50"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
