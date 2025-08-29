'use client'

import { useEffect, useState } from 'react'
import { exportToCSV, downloadPDF } from '@/lib/export-utils'

interface BillingEvent {
  id: string
  date: string
  type: 'payment' | 'plan_change' | 'cancellation' | 'refund'
  description: string
  amount?: number
  status: 'success' | 'pending' | 'failed'
  planName?: string
}

export function BillingHistory() {
  const [events, setEvents] = useState<BillingEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvoiceModal, setShowInvoiceModal] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<BillingEvent | null>(null)

  useEffect(() => {
    loadBillingHistory()
  }, [])

  const loadBillingHistory = async () => {
    try {
      // In a real app, this would fetch from your billing provider (Stripe, etc.)
      // For demo, we'll generate some realistic billing history
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate API call

      const mockEvents: BillingEvent[] = [
        {
          id: '1',
          date: '2025-01-28',
          type: 'payment',
          description: 'Monthly subscription payment',
          amount: 2999,
          status: 'success',
          planName: 'Pro Plan'
        },
        {
          id: '2', 
          date: '2025-01-15',
          type: 'plan_change',
          description: 'Upgraded from Basic to Pro',
          amount: 2000,
          status: 'success',
          planName: 'Pro Plan'
        },
        {
          id: '3',
          date: '2024-12-28',
          type: 'payment',
          description: 'Monthly subscription payment',
          amount: 999,
          status: 'success',
          planName: 'Basic Plan'
        },
        {
          id: '4',
          date: '2024-11-28',
          type: 'payment',
          description: 'Monthly subscription payment',
          amount: 999,
          status: 'success',
          planName: 'Basic Plan'
        },
        {
          id: '5',
          date: '2024-10-28',
          type: 'payment',
          description: 'Initial subscription payment',
          amount: 999,
          status: 'success',
          planName: 'Basic Plan'
        }
      ]

      setEvents(mockEvents)
    } catch (error) {
      console.error('Failed to load billing history:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatAmount = (amount: number) => {
    return `$${(amount / 100).toFixed(2)}`
  }

  const handleExportCSV = () => {
    console.log('📊 Exporting billing history to CSV...')
    exportToCSV(events)
    console.log('✅ CSV export initiated')
  }

  const handleExportPDF = () => {
    console.log('📊 Exporting billing history to PDF...')
    downloadPDF(events)
    console.log('✅ PDF export initiated')
  }

  const handleViewInvoice = (event: BillingEvent) => {
    console.log('📄 Opening invoice for event:', event.id)
    setSelectedInvoice(event)
    setShowInvoiceModal(true)
  }

  const closeInvoiceModal = () => {
    setSelectedInvoice(null)
    setShowInvoiceModal(false)
  }

  const getEventIcon = (type: BillingEvent['type'], status: BillingEvent['status']) => {
    if (status === 'failed') {
      return (
        <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
          <svg className="w-4 h-4 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      )
    }

    switch (type) {
      case 'payment':
        return (
          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
          </div>
        )
      case 'plan_change':
        return (
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
            </svg>
          </div>
        )
      case 'cancellation':
        return (
          <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L18.364 5.636M5.636 18.364l12.728-12.728" />
            </svg>
          </div>
        )
      case 'refund':
        return (
          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </div>
        )
      default:
        return (
          <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
        )
    }
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading billing history...</p>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow-lg p-8">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Billing History</h2>
      
      {/* Billing Integration Note */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="text-sm font-medium text-blue-800 mb-2">
          💳 Production Note: Billing History Integration
        </h3>
        <p className="text-xs text-blue-600">
          In production, this data would come from Stripe's billing history API. 
          You'd fetch invoices, payments, and subscription changes from Stripe's dashboard.
        </p>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          No billing history available yet.
        </div>
      ) : (
        <div className="space-y-4">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
              <div className="flex items-center space-x-4">
                {getEventIcon(event.type, event.status)}
                <div>
                  <p className="font-medium text-gray-900">{event.description}</p>
                  <div className="flex items-center space-x-2 text-sm text-gray-500">
                    <span>{new Date(event.date).toLocaleDateString()}</span>
                    {event.planName && (
                      <>
                        <span>•</span>
                        <span>{event.planName}</span>
                      </>
                    )}
                    <span>•</span>
                    <span className={`capitalize ${
                      event.status === 'success' ? 'text-green-600' :
                      event.status === 'failed' ? 'text-red-600' :
                      'text-yellow-600'
                    }`}>
                      {event.status}
                    </span>
                  </div>
                </div>
              </div>
              
              {event.amount && (
                <div className="text-right">
                  <p className={`font-medium ${
                    event.type === 'refund' ? 'text-red-600' : 'text-gray-900'
                  }`}>
                    {event.type === 'refund' ? '-' : ''}{formatAmount(event.amount)}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Download/Export Options */}
      <div className="mt-6 pt-6 border-t border-gray-200">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex flex-col sm:flex-row gap-2">
            <button 
              className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2"
              onClick={handleExportCSV}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download CSV
            </button>
            <button 
              className="bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2"
              onClick={handleExportPDF}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Download PDF
            </button>
          </div>
          <button 
            className="bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors flex items-center gap-2"
            onClick={() => events.length > 0 && handleViewInvoice(events[0])}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            View Sample Invoice
          </button>
        </div>
      </div>

      {/* Invoice Modal */}
      {showInvoiceModal && selectedInvoice && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
            <div className="p-6">
              {/* Invoice Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Invoice</h1>
                  <p className="text-gray-600">Payment Flow Learning</p>
                </div>
                <button
                  onClick={closeInvoiceModal}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Invoice Details */}
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Bill To:</h3>
                  <div className="text-gray-600">
                    <p>Demo Customer</p>
                    <p>demo@example.com</p>
                    <p>123 Demo Street</p>
                    <p>Demo City, DC 12345</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Invoice #:</span>
                      <span className="font-medium">INV-{selectedInvoice.id.padStart(4, '0')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Date:</span>
                      <span className="font-medium">{new Date(selectedInvoice.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Due Date:</span>
                      <span className="font-medium">{new Date(selectedInvoice.date).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium capitalize ${
                        selectedInvoice.status === 'success' ? 'text-green-600' :
                        selectedInvoice.status === 'failed' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                        {selectedInvoice.status === 'success' ? 'Paid' : selectedInvoice.status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Invoice Table */}
              <div className="border border-gray-200 rounded-lg overflow-hidden mb-8">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{selectedInvoice.description}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{selectedInvoice.planName || '-'}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right font-medium">
                        {selectedInvoice.amount ? formatAmount(selectedInvoice.amount) : '-'}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Invoice Total */}
              <div className="flex justify-end mb-8">
                <div className="w-64">
                  <div className="flex justify-between py-2 border-t border-gray-200">
                    <span className="font-medium text-gray-900">Subtotal:</span>
                    <span className="font-medium text-gray-900">
                      {selectedInvoice.amount ? formatAmount(selectedInvoice.amount) : '$0.00'}
                    </span>
                  </div>
                  <div className="flex justify-between py-2">
                    <span className="text-gray-600">Tax:</span>
                    <span className="text-gray-600">$0.00</span>
                  </div>
                  <div className="flex justify-between py-3 border-t border-gray-200">
                    <span className="text-lg font-semibold text-gray-900">Total:</span>
                    <span className="text-lg font-semibold text-gray-900">
                      {selectedInvoice.amount ? formatAmount(selectedInvoice.amount) : '$0.00'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Invoice Footer */}
              <div className="text-center text-sm text-gray-500 border-t border-gray-200 pt-6">
                <p>Thank you for your business!</p>
                <p className="mt-2">For questions about this invoice, please contact support@paymentflowlearning.com</p>
              </div>

              {/* Modal Actions */}
              <div className="flex justify-end gap-4 mt-8">
                <button
                  onClick={closeInvoiceModal}
                  className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    console.log('📊 Printing invoice for event:', selectedInvoice.id)
                    window.print()
                  }}
                  className="px-4 py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}