export default function SuperAdminPlaceholder({ title }: { title: string }) {
  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
        <p className="text-sm text-gray-500 mt-0.5">This section is under development</p>
      </div>
      <div className="bg-white rounded-xl border border-gray-200 px-6 py-16 text-center">
        <svg className="w-10 h-10 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
        </svg>
        <p className="text-sm font-medium text-gray-500">Coming Soon</p>
        <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
          The {title} module will be available in a future update.
        </p>
      </div>
    </div>
  )
}
