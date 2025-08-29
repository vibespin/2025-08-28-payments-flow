import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const { subscriptionId, newPlanId } = await request.json()

    if (!subscriptionId || !newPlanId) {
      return NextResponse.json(
        { message: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current subscription and new plan
    const [currentSubscription, newPlan] = await Promise.all([
      prisma.subscription.findUnique({
        where: { id: subscriptionId },
        include: { plan: true }
      }),
      prisma.plan.findUnique({
        where: { id: newPlanId }
      })
    ])

    if (!currentSubscription) {
      return NextResponse.json(
        { message: 'Subscription not found' },
        { status: 404 }
      )
    }

    if (!newPlan) {
      return NextResponse.json(
        { message: 'Plan not found' },
        { status: 404 }
      )
    }

    if (currentSubscription.status !== 'ACTIVE') {
      return NextResponse.json(
        { message: 'Can only change plans for active subscriptions' },
        { status: 400 }
      )
    }

    // Track the plan change event
    await prisma.event.create({
      data: {
        type: 'subscription_plan_changed',
        metadata: JSON.stringify({
          subscriptionId,
          oldPlanId: currentSubscription.planId,
          newPlanId: newPlanId,
          oldPlanName: currentSubscription.plan.name,
          newPlanName: newPlan.name,
          priceChange: newPlan.price - currentSubscription.plan.price
        })
      }
    })

    // In a real app with Stripe, you'd:
    // 1. Update the subscription in Stripe
    // 2. Handle proration logic
    // 3. Update payment method if needed
    // For demo, we'll simulate immediate change

    console.log('🔄 Processing plan change...')
    console.log(`   From: ${currentSubscription.plan.name} ($${currentSubscription.plan.price/100})`)
    console.log(`   To: ${newPlan.name} ($${newPlan.price/100})`)

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Update subscription with new plan
    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscriptionId },
      data: {
        planId: newPlanId,
        updatedAt: new Date()
      },
      include: {
        plan: true
      }
    })

    console.log('✅ Plan change completed successfully')

    return NextResponse.json({
      subscription: updatedSubscription,
      message: 'Plan changed successfully'
    })

  } catch (error) {
    console.error('Failed to change plan:', error)
    
    // Track the failure
    await prisma.event.create({
      data: {
        type: 'subscription_plan_change_failed',
        metadata: JSON.stringify({
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }).catch(() => {}) // Ignore event tracking errors

    return NextResponse.json(
      { message: 'Failed to change plan' },
      { status: 500 }
    )
  }
}