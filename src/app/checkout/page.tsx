'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Plan } from '@prisma/client'
import { PaymentForm } from '@/components/PaymentForm'
import { formatPrice } from '@/lib/analytics'

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const planId = searchParams.get('planId')
  
  const [plan, setPlan] = useState<Plan | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!planId) {
      router.push('/pricing')
      return
    }

    // Load plan details
    fetch(`/api/plans`)
      .then(res => res.json())
      .then(data => {
        const selectedPlan = data.plans.find((p: Plan) => p.id === planId)
        if (selectedPlan) {
          setPlan(selectedPlan)
          console.log('🛒 Checkout initiated for plan:', selectedPlan.name)
        } else {
          router.push('/pricing')
        }
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to load plan:', error)
        router.push('/pricing')
      })
  }, [planId, router])

  const handlePaymentSubmit = async (customerInfo: any, paymentMethod: any) => {
    setProcessing(true)
    setError(null)
    
    console.log('💳 Processing payment for:', customerInfo.email)

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          customerInfo,
          paymentMethod,
        }),
      })

      const result = await response.json()

      if (response.ok && result.success) {
        console.log('✅ Payment successful! Subscription ID:', result.subscription.id)
        // Redirect to success page with subscription info
        router.push(`/checkout/success?subscriptionId=${result.subscription.id}`)
      } else {
        console.log('❌ Payment failed:', result.error)
        setError(result.error || 'Payment failed. Please try again.')
      }
    } catch (error) {
      console.error('Checkout error:', error)
      setError('Something went wrong. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading checkout...</p>
        </div>
      </div>
    )
  }

  if (!plan) {
    return null // Will redirect to pricing
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Complete Your Purchase</h1>
          <p className="mt-2 text-gray-600">You're subscribing to the {plan.name} plan</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Summary */}
          <div className="bg-white p-8 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Order Summary</h2>
            
            <div className="border border-gray-200 rounded-lg p-6">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{plan.name}</h3>
                  <p className="text-gray-600 text-sm mt-1">{plan.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </div>
                  <div className="text-gray-600 text-sm">per {plan.interval}</div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <h4 className="font-medium text-gray-900 mb-3">What's included:</h4>
                <ul className="space-y-2">
                  {JSON.parse(plan.features).map((feature: string, index: number) => (
                    <li key={index} className="flex items-center text-sm text-gray-600">
                      <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>

              <div className="border-t border-gray-200 pt-4 mt-6">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-gray-900">Total</span>
                  <span className="text-2xl font-bold text-gray-900">
                    {formatPrice(plan.price)}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mt-1">
                  Includes 14-day free trial. Cancel anytime.
                </p>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <div>
            <PaymentForm 
              onSubmit={handlePaymentSubmit}
              loading={processing}
              error={error}
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push('/pricing')}
            className="text-blue-600 hover:text-blue-700 underline"
          >
            ← Back to pricing
          </button>
        </div>
      </div>
    </div>
  )
}