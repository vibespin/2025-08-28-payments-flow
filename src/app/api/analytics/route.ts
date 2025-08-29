import { NextRequest, NextResponse } from 'next/server'
import { trackEvent, EventType } from '@/lib/analytics'

export async function POST(request: NextRequest) {
  try {
    const { type, userId, metadata } = await request.json()

    if (!type) {
      return NextResponse.json(
        { error: 'Event type is required' },
        { status: 400 }
      )
    }

    await trackEvent(type as EventType, userId, metadata)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to track event:', error)
    return NextResponse.json(
      { error: 'Failed to track event' },
      { status: 500 }
    )
  }
}