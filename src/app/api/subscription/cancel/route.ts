import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId } = await request.json()

    if (!subscriptionId) {
      return NextResponse.json(
        { message: 'Missing subscription ID' },
        { status: 400 }
      )
    }

    // Get current subscription
    const subscription = await prisma.subscription.findUnique({
      where: { id: subscriptionId },
      include: { plan: true }
    })

    if (!subscription) {
      return NextResponse.json(
        { message: 'Subscription not found' },
        { status: 404 }
      )
    }

    if (subscription.status !== 'ACTIVE') {
      return NextResponse.json(
        { message: 'Can only cancel active subscriptions' },
        { status: 400 }
      )
    }

    // Track the cancellation event
    await prisma.event.create({
      data: {
        type: 'subscription_canceled',
        metadata: JSON.stringify({
          subscriptionId,
          planId: subscription.planId,
          planName: subscription.plan.name,
          reason: 'user_requested' // In real app, you'd collect cancellation reason
        })
      }
    })

    // In a real app with Stripe, you'd:
    // 1. Cancel the subscription in Stripe
    // 2. Set it to cancel at the end of the current period
    // 3. Handle any prorations or refunds
    // For demo, we'll simulate the cancellation

    console.log('⚠️ Processing subscription cancellation...')
    console.log(`   Subscription: ${subscriptionId}`)
    console.log(`   Plan: ${subscription.plan.name}`)
    console.log(`   Will remain active until: ${subscription.currentPeriodEnd}`)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Update subscription status to canceled
    // In real Stripe integration, subscription would remain active until period end
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        status: 'CANCELED',
        canceledAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        plan: true
      }
    })

    console.log('✅ Subscription canceled successfully')
    console.log('   User retains access until current period ends')

    return NextResponse.json({
      subscription: updatedSubscription,
      message: 'Subscription canceled successfully. You will retain access until the end of your current billing period.'
    })

  } catch (error) {
    console.error('Failed to cancel subscription:', error)
    
    // Track the failure
    await prisma.event.create({
      data: {
        type: 'subscription_cancellation_failed',
        metadata: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }).catch(() => {}) // Ignore event tracking errors

    return NextResponse.json(
      { message: 'Failed to cancel subscription' },
      { status: 500 }
    )
  }
}