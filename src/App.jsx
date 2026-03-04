import { Routes, Route, Navigate } from 'react-router-dom'
import AdminLayout from '@/components/layout/AdminLayout'
import { routes } from '@/routes/adminRoutes'

export default function App() {
  return (
    <Routes>
      {/* Root redirect */}
      <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />

      {/* Admin nested routes */}
      <Route path="/admin" element={<AdminLayout />}>
        {routes.map(({ path, element: Element }) => (
          <Route key={path} path={path} element={<Element />} />
        ))}
        {/* Fallback within /admin */}
        <Route index element={<Navigate to="dashboard" replace />} />
        <Route path="*" element={<Navigate to="dashboard" replace />} />
      </Route>

      {/* Global 404 fallback */}
      <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
    </Routes>
  )
}