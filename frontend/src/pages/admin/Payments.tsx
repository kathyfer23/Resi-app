import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Payment, Resident } from '../../types'
import { CreditCard, Plus, CheckCircle, Eye, Users, User } from 'lucide-react'
import toast from 'react-hot-toast'

const AdminPayments = () => {
  const [payments, setPayments] = useState<Payment[]>([])
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showMassModal, setShowMassModal] = useState(false)
  const [creating, setCreating] = useState(false)

  // Form states
  const [selectedResident, setSelectedResident] = useState('')
  const [paymentType, setPaymentType] = useState<'MAINTENANCE' | 'WATER' | 'GATE'>('MAINTENANCE')
  const [amount, setAmount] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [description, setDescription] = useState('')

  useEffect(() => {
    fetchPayments()
    fetchResidents()
  }, [])

  const fetchPayments = async () => {
    try {
      const response = await api.get('/payments')
      setPayments(response.data.payments)
    } catch (error) {
      console.error('Error fetching payments:', error)
      toast.error('Error al cargar los pagos')
    } finally {
      setLoading(false)
    }
  }

  const fetchResidents = async () => {
    try {
      const response = await api.get('/admin/residents')
      setResidents(response.data.residents)
    } catch (error) {
      console.error('Error fetching residents:', error)
      toast.error('Error al cargar los residentes')
    }
  }

  const markAsPaid = async (paymentId: string) => {
    try {
      await api.put(`/payments/${paymentId}/mark-paid`)
      setPayments(prev => 
        prev.map(payment => 
          payment.id === paymentId 
            ? { ...payment, status: 'PAID', paidDate: new Date().toISOString() }
            : payment
        )
      )
      toast.success('Pago marcado como pagado')
    } catch (error) {
      console.error('Error marking payment as paid:', error)
      toast.error('Error al marcar el pago')
    }
  }

  const createPayment = async () => {
    if (!selectedResident || !amount || !dueDate) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setCreating(true)
    try {
      const response = await api.post('/admin/create-payment', {
        residentId: selectedResident,
        type: paymentType,
        amount: parseFloat(amount),
        dueDate,
        description
      })

      toast.success('Pago creado exitosamente')
      setShowCreateModal(false)
      resetForm()
      fetchPayments()
    } catch (error: any) {
      console.error('Error creating payment:', error)
      toast.error(error.response?.data?.error || 'Error al crear el pago')
    } finally {
      setCreating(false)
    }
  }

  const createMassPayments = async () => {
    if (!amount || !dueDate) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }

    setCreating(true)
    try {
      const response = await api.post('/admin/create-mass-payments', {
        type: paymentType,
        amount: parseFloat(amount),
        dueDate,
        description
      })

      toast.success(`Pagos creados exitosamente para ${response.data.paymentsCount} residentes`)
      setShowMassModal(false)
      resetForm()
      fetchPayments()
    } catch (error: any) {
      console.error('Error creating mass payments:', error)
      toast.error(error.response?.data?.error || 'Error al crear los pagos')
    } finally {
      setCreating(false)
    }
  }

  const resetForm = () => {
    setSelectedResident('')
    setPaymentType('MAINTENANCE')
    setAmount('')
    setDueDate('')
    setDescription('')
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestionar Pagos</h1>
          <p className="text-gray-600">Administra todos los pagos del residencial</p>
        </div>
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowMassModal(true)}
            className="btn-secondary"
          >
            <Users className="h-4 w-4 mr-2" />
            Pagos Masivos
          </button>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            <Plus className="h-4 w-4 mr-2" />
            Nuevo Pago
          </button>
        </div>
      </div>

      <div className="card">
        {payments.length === 0 ? (
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
                    Residente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Tipo
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Monto
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Fecha Vencimiento
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
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.resident?.user?.name} ({payment.resident?.houseNumber})
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {payment.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      ${payment.amount.toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {new Date(payment.dueDate).toLocaleDateString('es-ES')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${
                        payment.status === 'PAID' ? 'badge-success' :
                        payment.status === 'PENDING' ? 'badge-warning' :
                        'badge-danger'
                      }`}>
                        {payment.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          className="text-primary-600 hover:text-primary-900"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                        {payment.status !== 'PAID' && (
                          <button
                            onClick={() => markAsPaid(payment.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Marcar como pagado"
                          >
                            <CheckCircle className="h-4 w-4" />
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

      {/* Modal para crear pago individual */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Crear Nuevo Pago</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Residente *
                </label>
                <select
                  value={selectedResident}
                  onChange={(e) => setSelectedResident(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="">Seleccionar residente</option>
                  {residents.map((resident) => (
                    <option key={resident.id} value={resident.id}>
                      {resident.user.name} ({resident.houseNumber})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pago *
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="WATER">Agua</option>
                  <option value="GATE">Garita</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción opcional del pago"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={creating}
              >
                Cancelar
              </button>
              <button
                onClick={createPayment}
                disabled={creating}
                className="btn-primary"
              >
                {creating ? 'Creando...' : 'Crear Pago'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para crear pagos masivos */}
      {showMassModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Crear Pagos Masivos</h2>
            <p className="text-sm text-gray-600 mb-4">
              Se crearán pagos para todos los residentes activos
            </p>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tipo de Pago *
                </label>
                <select
                  value={paymentType}
                  onChange={(e) => setPaymentType(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  <option value="MAINTENANCE">Mantenimiento</option>
                  <option value="WATER">Agua</option>
                  <option value="GATE">Garita</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Monto *
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  step="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha de Vencimiento *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descripción
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Descripción opcional del pago"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => {
                  setShowMassModal(false)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                disabled={creating}
              >
                Cancelar
              </button>
              <button
                onClick={createMassPayments}
                disabled={creating}
                className="btn-primary"
              >
                {creating ? 'Creando...' : 'Crear Pagos Masivos'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AdminPayments 