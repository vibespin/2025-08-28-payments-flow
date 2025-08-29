'use client'

import { Plan } from '@prisma/client'
import { formatPrice } from '@/lib/analytics'

interface PlanCardProps {
  plan: Plan
  onSelect: (planId: string) => void
  isPopular?: boolean
}

export function PlanCard({ plan, onSelect, isPopular }: PlanCardProps) {
  const features = JSON.parse(plan.features) as string[]

  return (
    <div className={`relative border rounded-lg p-6 h-full flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
      isPopular 
        ? 'border-blue-500 bg-blue-50 hover:bg-blue-100' 
        : 'border-gray-200 bg-white hover:border-gray-300'
    }`}>
      {isPopular && (
        <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
          <span className="bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-medium">
            Most Popular
          </span>
        </div>
      )}
      
      <div className="text-center">
        <h3 className="text-xl font-semibold text-gray-900">{plan.name}</h3>
        <p className="text-gray-600 mt-2">{plan.description}</p>
        
        <div className="mt-4">
          <span className="text-4xl font-bold text-gray-900">
            {formatPrice(plan.price)}
          </span>
          <span className="text-gray-600">/{plan.interval}</span>
        </div>
      </div>

      <ul className="mt-6 space-y-3 flex-grow">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center">
            <svg 
              className="h-5 w-5 text-green-500 mr-3" 
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
            <span className="text-gray-700">{feature}</span>
          </li>
        ))}
      </ul>

      <button
        onClick={() => onSelect(plan.id)}
        className={`w-full mt-8 px-4 py-3 rounded-lg font-medium transition-all duration-200 transform hover:scale-105 ${
          isPopular
            ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg'
            : 'bg-gray-900 hover:bg-gray-800 text-white shadow-md hover:shadow-lg'
        }`}
      >
        Get Started
      </button>
    </div>
  )
}