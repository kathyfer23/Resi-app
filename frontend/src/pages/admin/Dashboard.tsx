import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { AdminStats } from '../../types'
import { 
  Users, 
  CreditCard, 
  FileText, 
  Bell,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  DollarSign
} from 'lucide-react'

const AdminDashboard = () => {
  const [stats, setStats] = useState<AdminStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await api.get('/admin/stats')
      setStats(response.data.stats)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Panel de Administración</h1>
        <p className="text-gray-600">Resumen general del residencial</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total residentes</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalResidents || 0}
              </p>
              <p className="text-xs text-gray-500">
                {stats?.activeResidents || 0} activos
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-success-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total pagos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalPayments || 0}
              </p>
              <p className="text-xs text-gray-500">
                Registrados en el sistema
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-warning-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Documentos</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalDocuments || 0}
              </p>
              <p className="text-xs text-gray-500">
                Generados
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-info-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-info-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Notificaciones</p>
              <p className="text-2xl font-bold text-gray-900">
                {stats?.totalNotifications || 0}
              </p>
              <p className="text-xs text-gray-500">
                Enviadas
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Users className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Gestionar residentes</h3>
              <p className="text-sm text-gray-500">Ver y administrar residentes</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/admin/residents"
              className="btn-primary w-full text-center"
            >
              Ir a residentes
            </a>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-success-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Gestionar pagos</h3>
              <p className="text-sm text-gray-500">Registrar y controlar pagos</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/admin/payments"
              className="btn-primary w-full text-center"
            >
              Ir a pagos
            </a>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-warning-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Generar documentos</h3>
              <p className="text-sm text-gray-500">Facturas y recibos</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/admin/documents"
              className="btn-primary w-full text-center"
            >
              Ir a documentos
            </a>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Actividad reciente</h2>
        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Sistema funcionando correctamente</p>
              <p className="text-xs text-gray-500">Última verificación: hace 5 minutos</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <p className="text-sm text-gray-900">Dashboard actualizado</p>
              <p className="text-xs text-gray-500">Estadísticas en tiempo real</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard 