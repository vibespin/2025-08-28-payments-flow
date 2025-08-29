'use client'

import { useEffect, useState } from 'react'
import { Plan, Subscription } from '@prisma/client'
import Link from 'next/link'
import { BillingHistory } from '@/components/BillingHistory'

interface SubscriptionWithPlan extends Subscription {
  plan: Plan
}

export default function ManageSubscriptionPage() {
  const [subscription, setSubscription] = useState<SubscriptionWithPlan | null>(null)
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    console.log('📊 Tracking subscription_management_viewed event')
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'subscription_management_viewed',
        metadata: { page: 'manage' }
      }),
    })
    .then(() => console.log('✅ Event tracked: subscription_management_viewed'))
    .catch(error => console.error('❌ Event tracking failed:', error))

    loadSubscriptionData()
  }, [])

  const loadSubscriptionData = async () => {
    try {
      // In a real app, you'd get the user's subscription
      // For demo, we'll get the most recent active subscription
      const [subscriptionRes, plansRes] = await Promise.all([
        fetch('/api/subscription/current'),
        fetch('/api/plans')
      ])

      if (subscriptionRes.ok) {
        const subData = await subscriptionRes.json()
        setSubscription(subData.subscription)
      }

      if (plansRes.ok) {
        const plansData = await plansRes.json()
        setAvailablePlans(plansData.plans)
      }
    } catch (error) {
      console.error('Failed to load subscription data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePlanChange = async (newPlanId: string) => {
    if (!subscription) return

    console.log('🔄 Starting plan change...')
    console.log('   From:', subscription.plan.name)
    console.log('   To plan ID:', newPlanId)
    
    setActionLoading('change-plan')
    
    try {
      const response = await fetch('/api/subscription/change-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          subscriptionId: subscription.id,
          newPlanId 
        })
      })

      const responseData = await response.json()
      console.log('📊 Plan change response:', responseData)

      if (response.ok) {
        console.log('✅ Plan changed successfully!')
        await loadSubscriptionData()
      } else {
        console.error('❌ Plan change failed:', responseData)
        alert(`Failed to change plan: ${responseData.message || 'Please try again.'}`)
      }
    } catch (error) {
      console.error('❌ Plan change failed:', error)
      alert('Failed to change plan. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  const handleCancelSubscription = async () => {
    if (!subscription || !confirm('Are you sure you want to cancel your subscription? You will retain access until the end of your current billing period.')) {
      return
    }

    console.log('⚠️ Starting subscription cancellation...')
    console.log('   Subscription ID:', subscription.id)
    console.log('   Plan:', subscription.plan.name)
    
    setActionLoading('cancel')

    try {
      const response = await fetch('/api/subscription/cancel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subscriptionId: subscription.id })
      })

      const responseData = await response.json()
      console.log('📊 Cancellation response:', responseData)

      if (response.ok) {
        console.log('✅ Subscription canceled successfully!')
        await loadSubscriptionData()
      } else {
        console.error('❌ Cancellation failed:', responseData)
        alert(`Failed to cancel subscription: ${responseData.message || 'Please try again.'}`)
      }
    } catch (error) {
      console.error('❌ Cancellation failed:', error)
      alert('Failed to cancel subscription. Please try again.')
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your subscription...</p>
        </div>
      </div>
    )
  }

  if (!subscription) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto text-center px-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">No Active Subscription</h1>
          <p className="text-gray-600 mb-6">You don't have an active subscription yet.</p>
          <Link
            href="/pricing"
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            View Pricing Plans
          </Link>
        </div>
      </div>
    )
  }

  const currentPlan = subscription.plan
  const isActive = subscription.status === 'ACTIVE'
  const isCanceled = subscription.status === 'CANCELED'

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Manage Subscription</h1>
          <p className="mt-4 text-xl text-gray-600">
            View and update your subscription details
          </p>
        </div>

        {/* Current Subscription Card */}
        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Current Subscription</h2>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${
              isActive ? 'bg-green-100 text-green-800' :
              isCanceled ? 'bg-red-100 text-red-800' :
              'bg-yellow-100 text-yellow-800'
            }`}>
              {subscription.status}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Plan Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Plan Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Plan Name:</span>
                  <span className="font-medium text-gray-900">{currentPlan.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Price:</span>
                  <span className="font-medium text-gray-900">
                    ${(currentPlan.price / 100).toFixed(2)}/{currentPlan.interval}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Features:</span>
                  <span className="font-medium text-gray-900">{typeof currentPlan.features === 'string' ? JSON.parse(currentPlan.features).length : currentPlan.features.length} included</span>
                </div>
              </div>
            </div>

            {/* Billing Details */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Billing Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Period:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(subscription.currentPeriodStart).toLocaleDateString()} - {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Next Billing:</span>
                  <span className="font-medium text-gray-900">
                    {isCanceled ? 'Subscription ends' : 'Renews'} {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Subscription ID:</span>
                  <span className="font-mono text-sm text-gray-900">{subscription.id.slice(-8)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Feature List */}
          <div className="mt-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Plan Includes</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {(typeof currentPlan.features === 'string' ? JSON.parse(currentPlan.features) : currentPlan.features).map((feature: string, index: number) => (
                <div key={index} className="flex items-center">
                  <svg className="h-5 w-5 text-green-500 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Plan Change Options */}
        {isActive && (
          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Change Plan</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {availablePlans
                .filter(plan => plan.id !== currentPlan.id)
                .map((plan) => (
                  <div key={plan.id} className="border border-gray-200 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{plan.name}</h3>
                    <div className="text-3xl font-bold text-gray-900 mb-4">
                      ${(plan.price / 100).toFixed(2)}
                      <span className="text-base font-normal text-gray-500">/{plan.interval}</span>
                    </div>
                    <ul className="space-y-2 mb-6">
                      {(typeof plan.features === 'string' ? JSON.parse(plan.features) : plan.features).slice(0, 3).map((feature: string, index: number) => (
                        <li key={index} className="flex items-center text-sm text-gray-600">
                          <svg className="h-4 w-4 text-green-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    <button
                      onClick={() => handlePlanChange(plan.id)}
                      disabled={actionLoading === 'change-plan'}
                      className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-2 px-4 rounded-lg font-medium transition-colors"
                    >
                      {actionLoading === 'change-plan' ? 'Changing...' : 
                       plan.price > currentPlan.price ? 'Upgrade' : 'Downgrade'}
                    </button>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Billing History */}
        <BillingHistory />

        {/* Actions */}
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Subscription Actions</h2>
          <div className="flex flex-col sm:flex-row gap-4">
            {isActive && (
              <button
                onClick={handleCancelSubscription}
                disabled={actionLoading === 'cancel'}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg font-medium transition-colors"
              >
                {actionLoading === 'cancel' ? 'Canceling...' : 'Cancel Subscription'}
              </button>
            )}
            
            {isCanceled && (
              <Link
                href="/pricing"
                className="bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-medium transition-colors text-center"
              >
                Reactivate Subscription
              </Link>
            )}

            <Link
              href="/"
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-3 px-6 rounded-lg font-medium transition-colors text-center"
            >
              Back to Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}