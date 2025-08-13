import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Resident } from '../../types'
import { Users, Search, Eye, ToggleLeft, ToggleRight } from 'lucide-react'

const AdminResidents = () => {
  const [residents, setResidents] = useState<Resident[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')

  useEffect(() => {
    fetchResidents()
  }, [])

  const fetchResidents = async () => {
    try {
      const response = await api.get('/admin/residents')
      setResidents(response.data.residents)
    } catch (error) {
      console.error('Error fetching residents:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleResidentStatus = async (residentId: string, currentStatus: boolean) => {
    try {
      await api.put(`/admin/residents/${residentId}/status`, {
        isActive: !currentStatus
      })
      setResidents(prev => 
        prev.map(resident => 
          resident.id === residentId 
            ? { ...resident, isActive: !currentStatus }
            : resident
        )
      )
    } catch (error) {
      console.error('Error toggling resident status:', error)
    }
  }

  const filteredResidents = residents.filter(resident =>
    resident.houseNumber.toLowerCase().includes(search.toLowerCase()) ||
    resident.user?.name.toLowerCase().includes(search.toLowerCase()) ||
    resident.user?.email.toLowerCase().includes(search.toLowerCase())
  )

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
        <h1 className="text-2xl font-bold text-gray-900">Gestionar Residentes</h1>
        <p className="text-gray-600">Administra los residentes del residencial</p>
      </div>

      {/* Search */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por casa, nombre o email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Residents Table */}
      <div className="card">
        {filteredResidents.length === 0 ? (
          <div className="text-center py-8">
            <Users className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay residentes</h3>
            <p className="mt-1 text-sm text-gray-500">
              {search ? 'No se encontraron residentes con esa búsqueda.' : 'No hay residentes registrados.'}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Casa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Teléfono
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
                {filteredResidents.map((resident) => (
                  <tr key={resident.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {resident.houseNumber}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {resident.user?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resident.user?.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {resident.phone || 'No especificado'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`badge ${resident.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {resident.isActive ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleResidentStatus(resident.id, resident.isActive)}
                          className="text-gray-400 hover:text-gray-600"
                          title={resident.isActive ? 'Desactivar' : 'Activar'}
                        >
                          {resident.isActive ? (
                            <ToggleLeft className="h-4 w-4" />
                          ) : (
                            <ToggleRight className="h-4 w-4" />
                          )}
                        </button>
                        <button
                          className="text-primary-600 hover:text-primary-900"
                          title="Ver detalles"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

export default AdminResidents 