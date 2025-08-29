'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

interface Subscription {
  id: string
  status: string
  currentPeriodEnd: string
  plan: {
    name: string
    price: number
  }
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const subscriptionId = searchParams.get('subscriptionId')
  
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!subscriptionId) {
      router.push('/pricing')
      return
    }

    console.log('🎉 Checkout success! Subscription ID:', subscriptionId)

    // In a real app, you'd fetch subscription details from your API
    // For now, we'll simulate success since we know the checkout worked
    setTimeout(() => {
      setSubscription({
        id: subscriptionId,
        status: 'active',
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        plan: {
          name: 'Selected Plan', // In real app, fetch from API
          price: 999
        }
      })
      setLoading(false)
    }, 1000)
  }, [subscriptionId, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Confirming your subscription...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-lg p-8 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-100 mb-6">
            <svg 
              className="h-8 w-8 text-green-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M5 13l4 4L19 7" 
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            🎉 Payment Successful!
          </h1>
          
          <p className="text-lg text-gray-600 mb-8">
            Welcome to your new subscription! Your account has been set up and you're ready to get started.
          </p>

          {/* Subscription Details */}
          <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Subscription Details</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium">Subscription ID:</span>
                <span className="font-mono text-sm text-gray-900">{subscription?.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium">Status:</span>
                <span className="capitalize text-green-600 font-medium">
                  {subscription?.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-900 font-medium">Next billing date:</span>
                <span className="text-gray-900">
                  {subscription?.currentPeriodEnd 
                    ? new Date(subscription.currentPeriodEnd).toLocaleDateString()
                    : 'N/A'
                  }
                </span>
              </div>
            </div>
          </div>

          {/* Phase 3 Preview */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
            <h3 className="text-sm font-medium text-blue-800 mb-2">
              📈 Phase 3 Preview: Subscription Management
            </h3>
            <p className="text-sm text-blue-600">
              In Phase 3, you'll be able to view and manage your subscription, 
              change plans, update billing, and see usage analytics.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/manage"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Manage Subscription
            </Link>
            <Link
              href="/"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Back to Home
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Questions? Contact our support team anytime.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}