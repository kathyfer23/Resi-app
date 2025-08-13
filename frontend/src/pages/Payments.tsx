import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { usePayment } from '../contexts/PaymentContext'
import { Payment } from '../types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Download, Eye, CreditCard, AlertCircle } from 'lucide-react'
import { loadStripe } from '@stripe/stripe-js'
import toast from 'react-hot-toast'

const Payments = () => {
  const { refreshPayments } = usePayment()
  const [payments, setPayments] = useState<Payment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [filter, setFilter] = useState('')
  const [processingPayment, setProcessingPayment] = useState<string | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [selectedPayment, setSelectedPayment] = useState<Payment | null>(null)

  useEffect(() => {
    fetchPayments()
  }, [currentPage, filter])

  const fetchPayments = async () => {
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10'
      })
      
      if (filter) {
        params.append('status', filter)
      }

      const response = await api.get(`/payments/my-payments?${params}`)
      setPayments(response.data.payments)
      setTotalPages(response.data.pagination.pages)
    } catch (error) {
      console.error('Error fetching payments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePayment = async (payment: Payment) => {
    try {
      setSelectedPayment(payment)
      setShowPaymentModal(true)
    } catch (error) {
      console.error('Error opening payment modal:', error)
      toast.error('Error al abrir el modal de pago')
    }
  }

  const processPayment = async (paymentMethodId: string) => {
    if (!selectedPayment) return

    try {
      setProcessingPayment(selectedPayment.id)
      
      // Crear PaymentIntent
      const response = await api.post('/payments/create-payment-intent', {
        paymentId: selectedPayment.id,
        paymentMethodId
      })

      const { clientSecret, paymentIntentId } = response.data

      // Cargar Stripe
      const stripe = await loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY || 'pk_test_51ABC123DEF456GHI789JKL012MNO345PQR678STU901VWX234YZA567BCD890EFG')
      
      if (!stripe) {
        throw new Error('Stripe no se pudo cargar')
      }

      // Confirmar el pago
      const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: paymentMethodId
      })

      if (error) {
        throw new Error(error.message)
      }

      // Confirmar el pago en el backend
      await api.post('/payments/confirm-payment', {
        paymentIntentId,
        paymentId: selectedPayment.id
      })

      toast.success('¡Pago procesado exitosamente!')
      setShowPaymentModal(false)
      setSelectedPayment(null)
      fetchPayments() // Recargar pagos
      
    } catch (error: any) {
      console.error('Error processing payment:', error)
      toast.error(error.message || 'Error al procesar el pago')
    } finally {
      setProcessingPayment(null)
    }
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
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Mis Pagos</h1>
        <p className="text-gray-600">Historial de todos tus pagos</p>
      </div>

      {/* Filtros */}
      <div className="flex gap-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="input max-w-xs"
        >
          <option value="">Todos los estados</option>
          <option value="PENDING">Pendientes</option>
          <option value="PAID">Pagados</option>
          <option value="OVERDUE">Vencidos</option>
        </select>
      </div>

      {/* Tabla de pagos */}
      <div className="card">
        {payments.length === 0 ? (
          <div className="text-center py-8">
            <div className="mx-auto h-12 w-12 text-gray-400">
              <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay pagos</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se han encontrado pagos con los filtros aplicados.
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
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {payments.map((payment) => (
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          className="text-primary-600 hover:text-primary-900"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {(payment.status === 'PENDING' || payment.status === 'OVERDUE') && (
                          <button
                            onClick={() => handlePayment(payment)}
                            disabled={processingPayment === payment.id}
                            className="text-green-600 hover:text-green-900 disabled:opacity-50"
                            title="Pagar"
                          >
                            <CreditCard className="h-4 w-4" />
                          </button>
                        )}
                        {payment.status === 'PAID' && (
                          <button
                            className="text-green-600 hover:text-green-900"
                            title="Descargar recibo"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="btn-secondary disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="btn-secondary disabled:opacity-50"
            >
              Siguiente
            </button>
          </div>
          <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Página <span className="font-medium">{currentPage}</span> de{' '}
                <span className="font-medium">{totalPages}</span>
              </p>
            </div>
            <div>
              <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Pago */}
      {showPaymentModal && selectedPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Procesar Pago</h3>
              <button
                onClick={() => {
                  setShowPaymentModal(false)
                  setSelectedPayment(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium text-gray-900">Detalles del Pago</h4>
                <div className="mt-2 space-y-1 text-sm text-gray-600">
                  <p><strong>Tipo:</strong> {getPaymentTypeLabel(selectedPayment.type)}</p>
                  <p><strong>Monto:</strong> ${selectedPayment.amount.toFixed(2)}</p>
                  <p><strong>Vencimiento:</strong> {format(new Date(selectedPayment.dueDate), 'dd/MM/yyyy', { locale: es })}</p>
                  {selectedPayment.description && (
                    <p><strong>Descripción:</strong> {selectedPayment.description}</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                  <div className="text-sm text-blue-800">
                    <p className="font-medium">Información de Pago</p>
                    <p className="mt-1">
                      Este pago será procesado de forma segura a través de Stripe. 
                      Se te redirigirá a la página de pago de Stripe para completar la transacción.
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => {
                    setShowPaymentModal(false)
                    setSelectedPayment(null)
                  }}
                  className="flex-1 btn-secondary"
                  disabled={processingPayment === selectedPayment.id}
                >
                  Cancelar
                </button>
                                 <button
                   onClick={async () => {
                     if (!selectedPayment) return
                     
                     try {
                       setProcessingPayment(selectedPayment.id)
                       
                       // Llamar al backend para marcar el pago como pagado
                       await api.post('/payments/mark-as-paid', {
                         paymentId: selectedPayment.id
                       })
                       
                       toast.success('¡Pago procesado exitosamente!')
                       setShowPaymentModal(false)
                       setSelectedPayment(null)
                       fetchPayments() // Recargar pagos para actualizar el estado
                       refreshPayments() // Recargar dashboard también
                     } catch (error: any) {
                       console.error('Error procesando pago:', error)
                       toast.error(error.response?.data?.error || 'Error al procesar el pago')
                     } finally {
                       setProcessingPayment(null)
                     }
                   }}
                   disabled={processingPayment === selectedPayment.id}
                   className="flex-1 btn-primary"
                 >
                   {processingPayment === selectedPayment.id ? (
                     <div className="flex items-center">
                       <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                       Procesando...
                     </div>
                   ) : (
                     'Pagar Ahora'
                   )}
                 </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Payments 