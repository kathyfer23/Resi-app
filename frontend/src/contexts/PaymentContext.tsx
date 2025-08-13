import React, { createContext, useContext, useState } from 'react'

interface PaymentContextType {
  refreshPayments: () => void
  setRefreshPayments: (callback: () => void) => void
}

const PaymentContext = createContext<PaymentContextType | undefined>(undefined)

export const PaymentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [refreshPayments, setRefreshPayments] = useState<() => void>(() => {})

  return (
    <PaymentContext.Provider value={{ refreshPayments, setRefreshPayments }}>
      {children}
    </PaymentContext.Provider>
  )
}

export const usePayment = () => {
  const context = useContext(PaymentContext)
  if (context === undefined) {
    throw new Error('usePayment must be used within a PaymentProvider')
  }
  return context
} 