export interface User {
  id: string
  email: string
  name: string
  role: 'ADMIN' | 'RESIDENT'
  resident?: Resident
  unreadNotifications?: number
}

export interface Resident {
  id: string
  userId: string
  houseNumber: string
  phone?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  user?: {
    name: string
    email: string
  }
}

export interface Payment {
  id: string
  residentId: string
  type: 'MAINTENANCE' | 'WATER' | 'GATE'
  amount: number
  dueDate: string
  paidDate?: string
  status: 'PENDING' | 'PAID' | 'OVERDUE' | 'CANCELLED'
  description?: string
  createdAt: string
  updatedAt: string
  resident?: {
    houseNumber: string
    user?: {
      name: string
      email: string
    }
  }
}

export interface Document {
  id: string
  residentId: string
  type: 'INVOICE' | 'RECEIPT' | 'NOTICE' | 'STATEMENT'
  title: string
  content: string
  filePath?: string
  sentDate: string
  isRead: boolean
  createdAt: string
  updatedAt: string
  resident?: {
    houseNumber: string
    user?: {
      name: string
      email: string
    }
  }
}

export interface Notification {
  id: string
  userId: string
  title: string
  message: string
  type: 'PAYMENT_DUE' | 'PAYMENT_RECEIVED' | 'DOCUMENT_SENT' | 'GENERAL'
  isRead: boolean
  createdAt: string
}

export interface PaymentSummary {
  totalPending: number
  totalPaid: number
  totalOverdue: number
  pendingAmount: number
}

export interface PaymentStats {
  totalPayments: number
  totalPending: number
  totalPaid: number
  totalOverdue: number
  totalAmount: number
  pendingAmount: number
  paidAmount: number
}

export interface AdminStats {
  totalResidents: number
  activeResidents: number
  totalUsers: number
  totalPayments: number
  totalDocuments: number
  totalNotifications: number
  paymentStats: Array<{
    status: string
    _count: { status: number }
    _sum: { amount: number }
  }>
  documentStats: Array<{
    type: string
    _count: { type: number }
  }>
}

export interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
}

export interface ApiResponse<T> {
  data?: T
  message?: string
  error?: string
  pagination?: Pagination
}

export interface LoginForm {
  email: string
  password: string
}

export interface RegisterForm {
  email: string
  password: string
  name: string
  houseNumber: string
  phone?: string
}

export interface PaymentForm {
  residentId: string
  type: 'MAINTENANCE' | 'WATER' | 'GATE'
  amount: number
  dueDate: string
  description?: string
}

export interface DocumentForm {
  residentId: string
  amount: number
  dueDate: string
  period: string
  consumption?: number
  description?: string
}

export interface NotificationForm {
  title: string
  message: string
  type: 'PAYMENT_DUE' | 'DOCUMENT_SENT' | 'GENERAL'
  residentIds?: string[]
} 