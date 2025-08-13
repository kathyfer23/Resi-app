import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { usePayment } from '../contexts/PaymentContext'
import { api } from '../lib/api'
import { PaymentSummary, Payment } from '../types'
import { 
  CreditCard, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  TrendingUp,
  FileText,
  Bell
} from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

const Dashboard = () => {
  const { user } = useAuth()
  const { setRefreshPayments } = usePayment()
  const [summary, setSummary] = useState<PaymentSummary | null>(null)
  const [recentPayments, setRecentPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
    // Registrar la función de recarga en el contexto
    setRefreshPayments(fetchDashboardData)
  }, [setRefreshPayments])

  const fetchDashboardData = async () => {
    try {
      const [summaryResponse, paymentsResponse] = await Promise.all([
        api.get('/payments/my-summary'),
        api.get('/payments/my-payments?limit=5')
      ])

      setSummary(summaryResponse.data.summary)
      setRecentPayments(paymentsResponse.data.payments)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Función para recargar datos del dashboard
  const refreshDashboard = () => {
    fetchDashboardData()
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PAID':
        return <span className="badge-success">Pagado</span>
      case 'PENDING':
        return <span className="badge-warning">Pendiente</span>
      case 'OVERDUE':
        return <span className="badge-danger">Vencido</span>
      default:
        return <span className="badge-info">{status}</span>
    }
  }

  const getPaymentTypeLabel = (type: string) => {
    switch (type) {
      case 'MAINTENANCE':
        return 'Mantenimiento'
      case 'WATER':
        return 'Agua'
      case 'GATE':
        return 'Garita'
      default:
        return type
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
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Bienvenido, {user?.name}
        </h1>
        <p className="text-gray-600">
          Casa {(user as any)?.resident?.houseNumber || 'N/A'} • Resumen de tu cuenta
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <DollarSign className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pendiente por pagar</p>
              <p className="text-2xl font-bold text-gray-900">
                ${summary?.pendingAmount.toFixed(2) || '0.00'}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <Clock className="w-5 h-5 text-warning-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pagos pendientes</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.totalPending || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-danger-100 rounded-lg flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-danger-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pagos vencidos</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.totalOverdue || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <CheckCircle className="w-5 h-5 text-success-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pagos realizados</p>
              <p className="text-2xl font-bold text-gray-900">
                {summary?.totalPaid || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Pagos Pendientes */}
      {((summary?.totalPending || 0) > 0 || (summary?.totalOverdue || 0) > 0) && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Pagos Pendientes</h2>
            <a href="/payments" className="text-primary-600 hover:text-primary-900 text-sm font-medium">
              Ver todos →
            </a>
          </div>
          
          <div className="space-y-3">
            {recentPayments
              .filter(payment => payment.status === 'PENDING' || payment.status === 'OVERDUE')
              .slice(0, 3)
              .map((payment) => (
                <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      payment.status === 'OVERDUE' ? 'bg-red-500' : 'bg-yellow-500'
                    }`}></div>
                    <div>
                      <p className="font-medium text-gray-900">
                        {getPaymentTypeLabel(payment.type)}
                      </p>
                      <p className="text-sm text-gray-500">
                        Vence: {format(new Date(payment.dueDate), 'dd/MM/yyyy', { locale: es })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </p>
                    <a
                      href="/payments"
                      className="text-primary-600 hover:text-primary-900 text-sm font-medium"
                    >
                      Pagar
                    </a>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* Recent Payments */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Pagos recientes</h2>
          <a
            href="/payments"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            Ver todos
          </a>
        </div>

        {recentPayments.length === 0 ? (
          <div className="text-center py-8">
            <CreditCard className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pagos</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se han registrado pagos aún.
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha de vencimiento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Estado
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentPayments.map((payment) => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {getPaymentTypeLabel(payment.type)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(payment.dueDate), 'dd/MM/yyyy', { locale: es })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(payment.status)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <CreditCard className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Ver pagos</h3>
              <p className="text-sm text-gray-500">Consulta tu historial de pagos</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/payments"
              className="btn-primary w-full text-center"
            >
              Ir a pagos
            </a>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Documentos</h3>
              <p className="text-sm text-gray-500">Facturas y recibos</p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/documents"
              className="btn-primary w-full text-center"
            >
              Ver documentos
            </a>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <Bell className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Notificaciones</h3>
              <p className="text-sm text-gray-500">
                {(user as any)?.unreadNotifications || 0} sin leer
              </p>
            </div>
          </div>
          <div className="mt-4">
            <a
              href="/notifications"
              className="btn-primary w-full text-center"
            >
              Ver notificaciones
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard 