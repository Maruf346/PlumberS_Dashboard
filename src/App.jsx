import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '@/components/layout/AdminLayout'
import { routes }  from '@/routes/adminRoutes'
import LoginPage   from '@/pages/login/LoginPage'
import { isLoggedIn } from '@/store/authStore'

// ── Simple guard: if not logged in, redirect to /login ────────────────────────
// In dev mode, isLoggedIn() returns true only after the login form is submitted.
function RequireAuth({ children }) {
  return isLoggedIn() ? children : <Navigate to="/login" replace />
}

export default function App() {
  return (
    <Routes>
      {/* ── Login (public) ── */}
      <Route path="/login" element={<LoginPage />} />

      {/* ── Root: redirect to login if not authed, else dashboard ── */}
      <Route path="/" element={<Navigate to="/login" replace />} />

      {/* ── Admin nested routes (protected) ── */}
      <Route
        path="/admin"
        element={
          <RequireAuth>
            <AdminLayout />
          </RequireAuth>
        }
      >
        {routes.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* ── Global fallback ── */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}