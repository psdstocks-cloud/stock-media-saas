import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check email timer in database
    const emailTimer = await prisma.emailResendTimer.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!emailTimer) {
      return NextResponse.json({
        hasActiveTimer: false,
        canSendEmail: true,
        remainingSeconds: 0
      })
    }

    const now = new Date()
    const timeSinceLastRequest = now.getTime() - emailTimer.lastSentAt.getTime()
    const minInterval = 3 * 60 * 1000 // 3 minutes

    if (timeSinceLastRequest >= minInterval) {
      // Timer has expired, clean up
      await prisma.emailResendTimer.delete({
        where: { email: email.toLowerCase() }
      })

      return NextResponse.json({
        hasActiveTimer: false,
        canSendEmail: true,
        remainingSeconds: 0
      })
    }

    const remainingSeconds = Math.ceil((minInterval - timeSinceLastRequest) / 1000)

    return NextResponse.json({
      hasActiveTimer: true,
      canSendEmail: false,
      remainingSeconds: remainingSeconds,
      nextAllowedAt: emailTimer.nextAllowedAt.getTime(),
      lastSentAt: emailTimer.lastSentAt.getTime()
    })

  } catch (error) {
    console.error('Check timer error:', error)
    return NextResponse.json(
      { error: 'An error occurred while checking timer status' },
      { status: 500 }
    )
  }
}
