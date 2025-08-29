'use client'

import { useState } from 'react'
import { validateCardNumber, validateExpiryDate, validateCVC } from '@/lib/payments/mock-processor'

interface PaymentFormProps {
  onSubmit: (customerInfo: CustomerInfo, paymentMethod: PaymentMethod) => void
  loading?: boolean
  error?: string | null
}

interface CustomerInfo {
  email: string
  name: string
}

interface PaymentMethod {
  cardNumber: string
  expiryMonth: string
  expiryYear: string
  cvc: string
  cardholderName: string
}

export function PaymentForm({ onSubmit, loading = false, error }: PaymentFormProps) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo>({
    email: '',
    name: '',
  })
  
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>({
    cardNumber: '',
    expiryMonth: '',
    expiryYear: '',
    cvc: '',
    cardholderName: '',
  })

  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  const formatCardNumber = (value: string) => {
    const cleaned = value.replace(/\D/g, '')
    const groups = cleaned.match(/.{1,4}/g) || []
    return groups.join(' ').substr(0, 19) // Max 16 digits + 3 spaces
  }

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {}

    if (!customerInfo.email) errors.email = 'Email is required'
    if (!customerInfo.name) errors.name = 'Name is required'
    if (!paymentMethod.cardholderName) errors.cardholderName = 'Cardholder name is required'
    
    if (!validateCardNumber(paymentMethod.cardNumber)) {
      errors.cardNumber = 'Invalid card number'
    }
    
    if (!validateExpiryDate(paymentMethod.expiryMonth, paymentMethod.expiryYear)) {
      errors.expiry = 'Invalid expiry date'
    }
    
    if (!validateCVC(paymentMethod.cvc)) {
      errors.cvc = 'Invalid CVC'
    }

    setValidationErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (validateForm()) {
      onSubmit(customerInfo, paymentMethod)
    }
  }

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-lg shadow-md">
      {/* Stripe Integration Callout */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          🔒 Production Note: Stripe Integration
        </h3>
        <p className="text-xs text-blue-600">
          In production, this form would use Stripe Elements for secure card input. 
          Card details would never touch your server - they go directly to Stripe's secure servers.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Customer Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:text-black"
                value={customerInfo.email}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, email: e.target.value }))}
              />
              {validationErrors.email && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.email}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Full Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:text-black"
                value={customerInfo.name}
                onChange={(e) => setCustomerInfo(prev => ({ ...prev, name: e.target.value }))}
              />
              {validationErrors.name && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.name}</p>
              )}
            </div>
          </div>
        </div>

        {/* Payment Information */}
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Payment Information</h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:text-black"
                value={paymentMethod.cardNumber}
                onChange={(e) => setPaymentMethod(prev => ({ 
                  ...prev, 
                  cardNumber: formatCardNumber(e.target.value)
                }))}
              />
              {validationErrors.cardNumber && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.cardNumber}</p>
              )}
              <p className="text-xs text-gray-500 mt-1">
                Test cards: 4000000000000002 (declined), 4242424242424242 (success)
              </p>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Month</label>
                <select
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:text-black"
                  value={paymentMethod.expiryMonth}
                  onChange={(e) => setPaymentMethod(prev => ({ ...prev, expiryMonth: e.target.value }))}
                >
                  <option value="">MM</option>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map(month => (
                    <option key={month} value={month.toString().padStart(2, '0')}>
                      {month.toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Year</label>
                <select
                  required
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:text-black"
                  value={paymentMethod.expiryYear}
                  onChange={(e) => setPaymentMethod(prev => ({ ...prev, expiryYear: e.target.value }))}
                >
                  <option value="">YY</option>
                  {Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i).map(year => (
                    <option key={year} value={(year % 100).toString().padStart(2, '0')}>
                      {(year % 100).toString().padStart(2, '0')}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">CVC</label>
                <input
                  type="text"
                  placeholder="123"
                  maxLength={4}
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:text-black"
                  value={paymentMethod.cvc}
                  onChange={(e) => setPaymentMethod(prev => ({ 
                    ...prev, 
                    cvc: e.target.value.replace(/\D/g, '')
                  }))}
                />
              </div>
            </div>
            {validationErrors.expiry && (
              <p className="text-red-500 text-sm">{validationErrors.expiry}</p>
            )}
            {validationErrors.cvc && (
              <p className="text-red-500 text-sm">{validationErrors.cvc}</p>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700">Cardholder Name</label>
              <input
                type="text"
                required
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:text-black"
                value={paymentMethod.cardholderName}
                onChange={(e) => setPaymentMethod(prev => ({ ...prev, cardholderName: e.target.value }))}
              />
              {validationErrors.cardholderName && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.cardholderName}</p>
              )}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
            loading
              ? 'bg-gray-400 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 transform hover:scale-105'
          } text-white shadow-md hover:shadow-lg`}
        >
          {loading ? (
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing Payment...
            </div>
          ) : (
            'Complete Payment'
          )}
        </button>
      </form>
    </div>
  )
}