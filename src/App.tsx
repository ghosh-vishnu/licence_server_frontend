import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Login from './pages/Login'
import SuperAdminLayout from './components/SuperAdminLayout'
import SuperAdminHome from './pages/SuperAdminHome'
import SuperAdminAllCompany from './pages/SuperAdminAllCompany'
import SuperAdminUserLicense from './pages/SuperAdminUserLicense'
import SuperAdminPlans from './pages/SuperAdminPlans'
import SuperAdminPlaceholder from './pages/SuperAdminPlaceholder'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: 'rgba(15, 10, 40, 0.92)',
            backdropFilter: 'blur(16px)',
            color: '#ede9fe',
            border: '1px solid rgba(139, 92, 246, 0.2)',
            borderRadius: '14px',
            padding: '14px 20px',
            fontSize: '14.5px',
            fontWeight: 500,
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.35), 0 0 0 1px rgba(255,255,255,0.04) inset',
            maxWidth: '380px',
          },
          success: {
            iconTheme: {
              primary: '#34d399',
              secondary: '#0f0a28',
            },
            style: {
              border: '1px solid rgba(52, 211, 153, 0.25)',
            },
          },
          error: {
            iconTheme: {
              primary: '#f87171',
              secondary: '#0f0a28',
            },
            style: {
              border: '1px solid rgba(248, 113, 113, 0.25)',
            },
          },
        }}
      />
      <Routes>
        <Route
          path="/login"
          element={isAuthenticated ? <Navigate to="/super-admin" replace /> : <Login />}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <SuperAdminLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<Navigate to="/super-admin" replace />} />
          <Route path="super-admin" element={<SuperAdminHome />} />
          <Route path="super-admin/company/all-company" element={<SuperAdminAllCompany />} />
          <Route path="super-admin/company/user-license" element={<SuperAdminUserLicense />} />
          <Route path="super-admin/plans" element={<SuperAdminPlans />} />
          <Route path="super-admin/subscriptions" element={<SuperAdminPlaceholder title="Subscriptions" />} />
          <Route path="super-admin/transactions" element={<SuperAdminPlaceholder title="Transactions" />} />
          <Route path="super-admin/settings" element={<SuperAdminPlaceholder title="Settings" />} />
        </Route>
        <Route path="*" element={isAuthenticated ? <Navigate to="/super-admin" replace /> : <Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
