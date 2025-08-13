import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { BarChart3, Download, Calendar } from 'lucide-react'

const AdminReports = () => {
  const [loading, setLoading] = useState(false)

  const generateReport = async () => {
    setLoading(true)
    try {
      const response = await api.get('/admin/payments-report')
      // Aquí se procesaría el reporte
      console.log('Reporte generado:', response.data)
    } catch (error) {
      console.error('Error generating report:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
        <p className="text-gray-600">Genera reportes y estadísticas del residencial</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Reporte de pagos</h3>
              <p className="text-sm text-gray-500">Estadísticas de pagos</p>
            </div>
          </div>
          <div className="mt-4">
            <button
              onClick={generateReport}
              disabled={loading}
              className="btn-primary w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Generar reporte
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-success-100 rounded-lg flex items-center justify-center">
                <Calendar className="w-5 h-5 text-success-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Reporte mensual</h3>
              <p className="text-sm text-gray-500">Resumen del mes</p>
            </div>
          </div>
          <div className="mt-4">
            <button className="btn-primary w-full">
              <Download className="h-4 w-4 mr-2" />
              Generar reporte
            </button>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-warning-100 rounded-lg flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-warning-600" />
              </div>
            </div>
            <div className="ml-4">
              <h3 className="text-sm font-medium text-gray-900">Reporte de morosos</h3>
              <p className="text-sm text-gray-500">Pagos vencidos</p>
            </div>
          </div>
          <div className="mt-4">
            <button className="btn-primary w-full">
              <Download className="h-4 w-4 mr-2" />
              Generar reporte
            </button>
          </div>
        </div>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Estadísticas rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-primary-600">0</div>
            <div className="text-sm text-gray-500">Pagos pendientes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-success-600">0</div>
            <div className="text-sm text-gray-500">Pagos realizados</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-danger-600">0</div>
            <div className="text-sm text-gray-500">Pagos vencidos</div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminReports 