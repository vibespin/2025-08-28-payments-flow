import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { trackEvent } from '@/lib/analytics'
import { processPayment, createCustomer, PaymentMethod } from '@/lib/payments/mock-processor'

export async function POST(request: NextRequest) {
  try {
    const { planId, customerInfo, paymentMethod } = await request.json()

    console.log('🛒 Processing checkout for plan:', planId)
    await trackEvent('checkout_started', customerInfo.email, { planId })

    // Validate required fields
    if (!planId || !customerInfo || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get the plan from database
    const plan = await prisma.plan.findUnique({
      where: { id: planId },
    })

    if (!plan) {
      return NextResponse.json(
        { error: 'Plan not found' },
        { status: 404 }
      )
    }

    console.log('📦 Plan found:', plan.name, `$${plan.price / 100}`)

    // Create customer (in production, this would be Stripe customer creation)
    const customer = await createCustomer(
      customerInfo.email,
      customerInfo.name
    )

    // Process payment using mock processor
    // 🚨 STRIPE INTEGRATION POINT: This is where you'd call Stripe's Payment Intents API
    const paymentResult = await processPayment(
      paymentMethod as PaymentMethod,
      plan.price,
      'usd'
    )

    if (!paymentResult.success) {
      console.log('❌ Payment failed:', paymentResult.error)
      await trackEvent('checkout_failed', customerInfo.email, { 
        planId, 
        error: paymentResult.error 
      })
      
      return NextResponse.json(
        { error: paymentResult.error },
        { status: 402 } // Payment Required
      )
    }

    console.log('✅ Payment successful!')

    // Create subscription in database
    const subscription = await prisma.subscription.create({
      data: {
        userId: customer.id,
        planId: plan.id,
        status: 'ACTIVE',
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      },
      include: {
        plan: true,
      },
    })

    console.log('📋 Subscription created:', subscription.id)

    // Track successful completion
    await trackEvent('checkout_completed', customerInfo.email, {
      planId,
      subscriptionId: subscription.id,
      paymentIntentId: paymentResult.paymentIntentId,
    })

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        plan: {
          name: subscription.plan.name,
          price: subscription.plan.price,
        }
      },
      paymentIntentId: paymentResult.paymentIntentId,
      customerId: customer.id,
    })

  } catch (error) {
    console.error('🚨 Checkout error:', error)
    return NextResponse.json(
      { error: 'Checkout processing failed' },
      { status: 500 }
    )
  }
}