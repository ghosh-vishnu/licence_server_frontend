import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'
import logoWhite from '../assets/logo-white-CvEM_RYU.png'

type NavItem =
  | { path: string; label: string; icon: string; children?: never }
  | { label: string; icon: string; path?: never; children: { path: string; label: string; icon: string }[] }

const sidebarNav: NavItem[] = [
  { path: '/super-admin', label: 'Dashboard', icon: 'dashboard' },
  {
    label: 'Company',
    icon: 'company',
    children: [
      { path: '/super-admin/company/all-company', label: 'All Company', icon: 'building' },
      { path: '/super-admin/company/user-license', label: 'User License', icon: 'user' },
    ],
  },
  { path: '/super-admin/plans', label: 'Plans', icon: 'document' },
  { path: '/super-admin/subscriptions', label: 'Subscriptions', icon: 'stack' },
  { path: '/super-admin/transactions', label: 'Transactions', icon: 'transaction' },
  { path: '/super-admin/settings', label: 'Settings', icon: 'settings' },
]

const breadcrumbMap: Record<string, string[]> = {
  '/super-admin': ['Dashboard'],
  '/super-admin/company/all-company': ['Company', 'All Company'],
  '/super-admin/company/user-license': ['Company', 'User License'],
  '/super-admin/plans': ['Plans'],
  '/super-admin/subscriptions': ['Subscriptions'],
  '/super-admin/transactions': ['Transactions'],
  '/super-admin/settings': ['Settings'],
}

function SvgIcon({ name, className = 'w-[18px] h-[18px]' }: { name: string; className?: string }) {
  const props = { className, fill: 'none' as const, stroke: 'currentColor', viewBox: '0 0 24 24', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (name) {
    case 'dashboard': return <svg {...props}><path d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" /></svg>
    case 'company': case 'building': return <svg {...props}><path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" /></svg>
    case 'user': return <svg {...props}><path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
    case 'document': return <svg {...props}><path d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
    case 'stack': return <svg {...props}><path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    case 'transaction': return <svg {...props}><path d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
    case 'settings': return <svg {...props}><path d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><circle cx="12" cy="12" r="3" /></svg>
    default: return null
  }
}

export default function SuperAdminLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [companyOpen, setCompanyOpen] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
    toast.success('Logged out')
  }

  const isActive = (path: string) => location.pathname === path
  const companyNav = sidebarNav.find((n) => 'children' in n && n.children?.length)
  const isCompanyActive = companyNav?.children?.some((c) => isActive(c.path)) ?? false
  const crumbs = breadcrumbMap[location.pathname] || []
  const userInitial = user?.username?.charAt(0)?.toUpperCase() || 'A'

  return (
    <div className="admin-shell">
      {/* SIDEBAR */}
      <aside className={`admin-sidebar ${collapsed ? 'admin-sidebar--collapsed' : ''}`}>
        <div className="admin-sidebar__logo">
          <img src={logoWhite} alt="VED" className={`object-contain ${collapsed ? 'h-7' : 'h-8'}`} />
        </div>

        <nav className="admin-sidebar__nav">
          {sidebarNav.map((item, idx) => {
            if ('children' in item && item.children?.length) {
              const open = item.label === 'Company' ? companyOpen : false
              return (
                <div key={item.label}>
                  <button
                    type="button"
                    onClick={() => item.label === 'Company' && setCompanyOpen(!companyOpen)}
                    title={collapsed ? item.label : undefined}
                    className={`admin-nav-item ${isCompanyActive ? 'admin-nav-item--active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}
                  >
                    <SvgIcon name={item.icon} />
                    {!collapsed && (
                      <>
                        <span className="flex-1">{item.label}</span>
                        <svg className={`w-4 h-4 text-slate-500 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                      </>
                    )}
                  </button>
                  {!collapsed && open && (
                    <div className="ml-5 mt-0.5 space-y-0.5 border-l border-slate-700 pl-3">
                      {item.children.map((child) => (
                        <Link key={child.path} to={child.path} className={`admin-nav-sub ${isActive(child.path) ? 'admin-nav-sub--active' : ''}`}>
                          <SvgIcon name={child.icon} className="w-4 h-4" />
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              )
            }
            if (!item.path) return null
            return (
              <div key={item.path}>
                {idx === 2 && !collapsed && <div className="admin-nav-label">Management</div>}
                <Link to={item.path} title={collapsed ? item.label : undefined} className={`admin-nav-item ${isActive(item.path) ? 'admin-nav-item--active' : ''} ${collapsed ? 'justify-center px-2' : ''}`}>
                  <SvgIcon name={item.icon} />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              </div>
            )
          })}
        </nav>

        <button type="button" onClick={() => setCollapsed(!collapsed)} className="admin-sidebar__toggle" aria-label="Toggle sidebar">
          <svg className={`w-4 h-4 transition-transform ${collapsed ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
        </button>
      </aside>

      {/* MAIN */}
      <div className="admin-main">
        <header className="admin-header">
          <nav className="flex items-center gap-1.5 text-sm">
            {crumbs.map((crumb, i) => (
              <span key={i} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-gray-300">/</span>}
                <span className={i === crumbs.length - 1 ? 'text-gray-900 font-medium' : 'text-gray-400'}>{crumb}</span>
              </span>
            ))}
          </nav>

          <div className="flex items-center gap-2.5">
            <button type="button" className="relative p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors" aria-label="Notifications">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </button>
            <div className="w-px h-6 bg-gray-200" />
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-indigo-600 text-white text-xs font-bold flex items-center justify-center">{userInitial}</div>
              <div className="hidden md:block leading-none">
                <p className="text-sm font-medium text-gray-800">{user?.username || 'Admin'}</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Super Admin</p>
              </div>
              <button type="button" onClick={handleLogout} className="p-1.5 rounded-md text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors" title="Logout">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
              </button>
            </div>
          </div>
        </header>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
