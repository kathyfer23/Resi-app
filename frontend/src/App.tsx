import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { PaymentProvider } from './contexts/PaymentContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Payments from './pages/Payments'
import Documents from './pages/Documents'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import AdminDashboard from './pages/admin/Dashboard'
import AdminResidents from './pages/admin/Residents'
import AdminPayments from './pages/admin/Payments'
import AdminDocuments from './pages/admin/Documents'
import AdminReports from './pages/admin/Reports'

function AppContent() {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    )
  }

  return (
    <Layout>
      <Routes>
        {/* Rutas para residentes */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/payments" element={<Payments />} />
        <Route path="/documents" element={<Documents />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/profile" element={<Profile />} />
        
        {/* Rutas para administradores */}
        {user.role === 'ADMIN' && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/residents" element={<AdminResidents />} />
            <Route path="/admin/payments" element={<AdminPayments />} />
            <Route path="/admin/documents" element={<AdminDocuments />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </>
        )}
        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <AuthProvider>
      <PaymentProvider>
        <AppContent />
      </PaymentProvider>
    </AuthProvider>
  )
}

export default App 