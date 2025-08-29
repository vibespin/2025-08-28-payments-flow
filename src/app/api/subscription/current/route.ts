import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // In a real app, you'd get the user ID from the session/auth
    // For demo purposes, we'll get the most recent active subscription
    const subscription = await prisma.subscription.findFirst({
      where: {
        OR: [
          { status: 'ACTIVE' },
          { status: 'TRIALING' },
          { status: 'CANCELED' }
        ]
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!subscription) {
      return NextResponse.json(
        { message: 'No subscription found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      subscription,
      message: 'Subscription retrieved successfully'
    })

  } catch (error) {
    console.error('Failed to fetch subscription:', error)
    return NextResponse.json(
      { message: 'Failed to fetch subscription' },
      { status: 500 }
    )
  }
}