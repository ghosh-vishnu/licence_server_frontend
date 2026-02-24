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
      <Toaster position="top-right" />
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
