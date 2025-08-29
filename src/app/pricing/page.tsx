'use client'

import { Plan } from '@prisma/client'
import { PlanCard } from '@/components/PlanCard'
import { useEffect, useState } from 'react'

export default function PricingPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Track pricing view event
    console.log('📊 Tracking pricing_viewed event')
    fetch('/api/analytics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        type: 'pricing_viewed',
        metadata: { page: 'pricing' }
      }),
    })
    .then(() => console.log('✅ Event tracked successfully'))
    .catch(error => console.error('❌ Event tracking failed:', error))

    // Load plans
    fetch('/api/plans')
      .then(res => res.json())
      .then(data => {
        setPlans(data.plans)
        setLoading(false)
      })
      .catch(error => {
        console.error('Failed to load plans:', error)
        setLoading(false)
      })
  }, [])

  const handleSelectPlan = (planId: string) => {
    console.log('🎯 Selected plan:', planId)
    // Redirect to checkout page with selected plan
    window.location.href = `/checkout?planId=${planId}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading plans...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">
            Choose Your Plan
          </h1>
          <p className="mt-4 text-xl text-gray-600">
            Simple, transparent pricing that grows with you
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan, index) => (
            <PlanCard
              key={plan.id}
              plan={plan}
              onSelect={handleSelectPlan}
              isPopular={index === 1} // Make the middle plan (Pro) popular
            />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-gray-600">
            All plans include a 14-day free trial. Cancel anytime.
          </p>
        </div>
      </div>
    </div>
  )
}