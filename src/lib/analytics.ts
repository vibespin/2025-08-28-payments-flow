import { prisma } from './db'

export type EventType = 
  | 'pricing_viewed'
  | 'checkout_started' 
  | 'checkout_completed'
  | 'subscription_updated'
  | 'subscription_canceled'

export async function trackEvent(
  type: EventType,
  userId?: string,
  metadata?: Record<string, any>
) {
  try {
    await prisma.event.create({
      data: {
        type,
        userId,
        metadata: metadata ? JSON.stringify(metadata) : null,
      },
    })
    
    console.log(`📊 Event tracked: ${type}`, { userId, metadata })
  } catch (error) {
    console.error('Failed to track event:', error)
  }
}

export function formatPrice(priceInCents: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(priceInCents / 100)
}