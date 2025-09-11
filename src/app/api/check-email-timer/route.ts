import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json({
        hasActiveTimer: false,
        canSendEmail: true,
        remainingSeconds: 0,
        message: 'No email provided'
      })
    }

    // Check email timer in database
    const emailTimer = await prisma.emailResendTimer.findUnique({
      where: { email: email.toLowerCase() }
    })

    if (!emailTimer) {
      return NextResponse.json({
        hasActiveTimer: false,
        canSendEmail: true,
        remainingSeconds: 0,
        message: 'No active timer found'
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
        remainingSeconds: 0,
        message: 'Timer expired'
      })
    }

    const remainingSeconds = Math.ceil((minInterval - timeSinceLastRequest) / 1000)
    const remainingMinutes = Math.ceil(remainingSeconds / 60)

    return NextResponse.json({
      hasActiveTimer: true,
      canSendEmail: false,
      remainingSeconds: remainingSeconds,
      remainingMinutes: remainingMinutes,
      nextAllowedAt: emailTimer.nextAllowedAt.getTime(),
      lastSentAt: emailTimer.lastSentAt.getTime(),
      message: `Timer active: ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} remaining`
    })

  } catch (error) {
    console.error('Check email timer error:', error)
    return NextResponse.json(
      { 
        hasActiveTimer: false,
        canSendEmail: true,
        remainingSeconds: 0,
        error: 'An error occurred while checking timer status' 
      },
      { status: 500 }
    )
  }
}
