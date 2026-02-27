import { UseFormRegister, UseFormWatch, FieldErrors } from 'react-hook-form'
import type { CreateLicenseFormValues } from '../schemas/licenseForm'

const ROLE_TOOLTIP = 'Super Admins: platform-wide access. Company Admins: manage company users and licenses. Normal Users: standard product access.'

interface RoleAllocationCardProps {
  register: UseFormRegister<CreateLicenseFormValues>
  watch: UseFormWatch<CreateLicenseFormValues>
  errors: FieldErrors<CreateLicenseFormValues>
  planLimit: number | null
}

export function RoleAllocationCard({ register, watch, errors, planLimit }: RoleAllocationCardProps) {
  const sa = watch('max_super_admins') ?? 1
  const ca = watch('max_company_admins') ?? 0
  const u = watch('max_users') ?? 10

  const total = (typeof sa === 'number' ? sa : parseInt(String(sa), 10) || 0) +
    (typeof ca === 'number' ? ca : parseInt(String(ca), 10) || 0) +
    (typeof u === 'number' ? u : parseInt(String(u), 10) || 0)

  const exceedsPlan = planLimit != null && planLimit > 0 && total > planLimit

  return (
    <div className="rounded-xl border border-gray-200 bg-gray-50/50 p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-semibold text-gray-900">Role Allocation</h4>
          <span
            className="text-gray-400 hover:text-gray-600 cursor-help"
            title={ROLE_TOOLTIP}
            aria-label={ROLE_TOOLTIP}
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Total Users</span>
          <span className={`text-lg font-bold tabular-nums ${exceedsPlan ? 'text-amber-600' : 'text-gray-900'}`}>
            {total}
          </span>
          {planLimit != null && planLimit > 0 && (
            <span className="text-xs text-gray-500">/ {planLimit}</span>
          )}
        </div>
      </div>

      {exceedsPlan && (
        <div className="mb-4 flex items-center gap-2 rounded-lg bg-amber-50 border border-amber-200 px-3 py-2 text-sm text-amber-800">
          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          Exceeds plan limit ({planLimit} users)
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Super Admins</label>
          <input
            type="number"
            min={0}
            max={100}
            step={1}
            {...register('max_super_admins', {
              valueAsNumber: true,
              min: { value: 0, message: 'Min 0' },
              max: { value: 100, message: 'Max 100' },
            })}
            onKeyDown={(e) => ['e', 'E', '.', '-'].includes(e.key) && e.preventDefault()}
            className="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-3 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors.max_super_admins && (
            <p className="mt-1 text-xs text-red-600">{errors.max_super_admins.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Company Admins</label>
          <input
            type="number"
            min={0}
            max={1000}
            step={1}
            {...register('max_company_admins', {
              valueAsNumber: true,
              min: { value: 0, message: 'Min 0' },
              max: { value: 1000, message: 'Max 1000' },
            })}
            onKeyDown={(e) => ['e', 'E', '.', '-'].includes(e.key) && e.preventDefault()}
            className="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-3 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors.max_company_admins && (
            <p className="mt-1 text-xs text-red-600">{errors.max_company_admins.message}</p>
          )}
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-600 mb-1.5">Normal Users</label>
          <input
            type="number"
            min={1}
            max={100000}
            step={1}
            {...register('max_users', {
              valueAsNumber: true,
              min: { value: 1, message: 'Min 1' },
              max: { value: 100000, message: 'Max 100000' },
            })}
            onKeyDown={(e) => ['e', 'E', '.', '-'].includes(e.key) && e.preventDefault()}
            className="block w-full rounded-lg border-gray-300 bg-white py-2.5 pl-3 pr-3 text-sm shadow-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
          {errors.max_users && (
            <p className="mt-1 text-xs text-red-600">{errors.max_users.message}</p>
          )}
        </div>
      </div>
    </div>
  )
}
