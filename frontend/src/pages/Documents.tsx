import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Document } from '../types'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Download, FileText, Receipt, AlertCircle } from 'lucide-react'

const Documents = () => {
  const [documents, setDocuments] = useState<Document[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDocuments()
  }, [])

  const fetchDocuments = async () => {
    try {
      const response = await api.get('/documents/my-documents')
      setDocuments(response.data.documents)
    } catch (error) {
      console.error('Error fetching documents:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = async (documentId: string) => {
    try {
      const response = await api.get(`/documents/download/${documentId}`, {
        responseType: 'blob'
      })
      
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', `documento-${documentId}.pdf`)
      document.body.appendChild(link)
      link.click()
      link.remove()
    } catch (error) {
      console.error('Error downloading document:', error)
    }
  }

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case 'INVOICE':
        return <FileText className="h-5 w-5 text-blue-600" />
      case 'RECEIPT':
        return <Receipt className="h-5 w-5 text-green-600" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-600" />
    }
  }

  const getDocumentTypeLabel = (type: string) => {
    switch (type) {
      case 'INVOICE':
        return 'Factura'
      case 'RECEIPT':
        return 'Recibo'
      case 'NOTICE':
        return 'Aviso'
      case 'STATEMENT':
        return 'Estado de cuenta'
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
        <h1 className="text-2xl font-bold text-gray-900">Mis Documentos</h1>
        <p className="text-gray-600">Facturas, recibos y documentos importantes</p>
      </div>

      <div className="card">
        {documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No hay documentos</h3>
            <p className="mt-1 text-sm text-gray-500">
              No se han generado documentos aún.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {documents.map((document) => (
              <div
                key={document.id}
                className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center space-x-4">
                  {getDocumentIcon(document.type)}
                  <div>
                    <h3 className="text-sm font-medium text-gray-900">
                      {document.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {getDocumentTypeLabel(document.type)} • {format(new Date(document.sentDate), 'dd/MM/yyyy', { locale: es })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {!document.isRead && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      Nuevo
                    </span>
                  )}
                  <button
                    onClick={() => handleDownload(document.id)}
                    className="btn-primary"
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Descargar
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Documents 